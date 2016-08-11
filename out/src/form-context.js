"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var metamodel_1 = require('@hn3000/metamodel');
var listener_manager_1 = require('./listener-manager');
var search_params_1 = require('./search-params');
var props_different_1 = require('./props-different');
var requestParams = search_params_1.parseSearchParams(location.search);
var overridePage = requestParams.page != null ? +(requestParams.page) : null;
var PAGE_INIT = -1;
var MetaFormContext = (function (_super) {
    __extends(MetaFormContext, _super);
    function MetaFormContext(config, metamodel, data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        _super.call(this);
        this._config = config;
        if (null != overridePage) {
            config.allowNextWhenInvalid = true;
        }
        this._metamodel = metamodel;
        var page = null != overridePage ? overridePage - (config.usePageIndex ? 0 : 1) : PAGE_INIT;
        this._viewmodel = new metamodel_1.ModelView(metamodel, data, page);
        this.pageBack = listener_manager_1.clickHandler(this.updatePage, this, -1);
        this.pageNext = listener_manager_1.clickHandler(this.updatePage, this, +1);
        this._listeners = new listener_manager_1.ListenerManager();
        this._promises = [];
        if (null != this._config.onFormInit) {
            var update = this._config.onFormInit(this);
            update.then(function (x) {
                var model = _this._viewmodel;
                if (typeof x === 'function') {
                    var clientUpdate = x;
                    model = clientUpdate(model, _this);
                }
                else if (null != x) {
                    model = model.withAddedData(x);
                }
                if (null == overridePage && model.currentPageIndex == PAGE_INIT) {
                    model = model.changePage(1);
                }
                _this._updateViewModel(model);
            });
            this._promiseInFlight(update);
        }
    }
    MetaFormContext.prototype.pageNextAllowed = function () {
        if (this.isBusy()) {
            return false;
        }
        var vm = this._viewmodel;
        var hasNext = vm.currentPageIndex < vm.getPages().length;
        var config = this._config;
        var validating = (config.validateOnUpdateIfInvalid
            || config.validateOnUpdateIfInvalid) && !config.allowNextWhenInvalid;
        return hasNext && (!validating || vm.isPageValid(null));
    };
    MetaFormContext.prototype.pageBackAllowed = function () {
        if (this.isBusy()) {
            return false;
        }
        var vm = this._viewmodel;
        return vm.currentPageIndex > 0;
    };
    Object.defineProperty(MetaFormContext.prototype, "config", {
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaFormContext.prototype, "metamodel", {
        get: function () {
            return this._metamodel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaFormContext.prototype, "viewmodel", {
        get: function () {
            return this._viewmodel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaFormContext.prototype, "currentPage", {
        get: function () {
            if (!this._config.usePageIndex) {
                return this._viewmodel.currentPageNo;
            }
            return this._viewmodel.currentPageIndex;
        },
        enumerable: true,
        configurable: true
    });
    MetaFormContext.prototype.getConclusion = function () {
        return this._conclusion;
    };
    MetaFormContext.prototype.setConclusion = function (conclusion) {
        if (null != this._conclusion && this._conclusion !== conclusion) {
            throw new Error("form already has a conclusion: " + this._conclusion + " " + conclusion);
        }
        this._conclusion = conclusion;
        this._updateViewModel(this._viewmodel.gotoPage(this._viewmodel.getPages().length));
    };
    /*
     * similar to redux: returns the unsubscribe function
     * listeners always called asynchronously: validation runs before
     * listeners are notfied
     */
    MetaFormContext.prototype.subscribe = function (listener) {
        return this._listeners.subscribe(listener);
    };
    MetaFormContext.prototype.updateModel = function (field, value) {
        this.updateModelTransactional(function (model) { return model.withChangedField(field, value); });
    };
    MetaFormContext.prototype.updateModelTransactional = function (updater, skipValidation) {
        var _this = this;
        var newModel = updater(this._viewmodel, this);
        var config = this._config;
        var nextUpdate = Promise.resolve(function (x) { return x; });
        if (config.onModelUpdate) {
            this._viewmodel = newModel;
            nextUpdate = config.onModelUpdate(this);
        }
        nextUpdate.then(function (updater) {
            var updatedModel = updater(newModel, _this);
            _this._updateViewModel(updatedModel);
            var needsValidation = config.validateOnUpdate;
            if (!needsValidation && config.validateOnUpdateIfInvalid) {
                needsValidation = !newModel.isValid();
            }
            if (!skipValidation && needsValidation) {
                var validator = function () {
                    var validated = _this._viewmodel.validateDefault();
                    validated.then(function (x) { return _this._updateViewModel(x); });
                    _this._debounceValidationTimeout = null;
                };
                if (_this._debounceValidationTimeout) {
                    clearTimeout(_this._debounceValidationTimeout);
                }
                _this._debounceValidationTimeout = setTimeout(validator, config.validateDebounceMS);
            }
        });
        this._promiseInFlight(nextUpdate);
    };
    MetaFormContext.prototype._updateViewModel = function (viewmodel) {
        this._viewmodel = viewmodel;
        this._notifyAll();
    };
    MetaFormContext.prototype._notifyAll = function () {
        this._listeners.all.forEach(function (x) { return x(); });
    };
    MetaFormContext.prototype.updatePage = function (step) {
        var _this = this;
        var model = this._viewmodel;
        var nextModel;
        if (step < 0) {
            nextModel = Promise.resolve(model);
        }
        else if (model.currentPageNo == model.getPages().length) {
            nextModel = model.validateFull();
        }
        else {
            nextModel = model.validatePage();
        }
        var promise = nextModel
            .then(function (validatedModel) {
            var override = false;
            if (_this._config.allowNextWhenInvalid) {
                if (!props_different_1.arraysDifferent(model.getPageMessages(), validatedModel.getPageMessages())) {
                    override = true;
                }
            }
            if (step < 0 || validatedModel.isPageValid(null) || override) {
                var promise;
                if (_this._config.onPageTransition) {
                    // replace model without notification 
                    // so onPageTransition handler starts with this one
                    _this._viewmodel = validatedModel;
                    var moreValidation = _this._config.onPageTransition(_this, step);
                    if (null == moreValidation) {
                        moreValidation = Promise.resolve([]);
                    }
                    promise = moreValidation.then(function (update) {
                        // clear out status messages first
                        var result = _this._viewmodel.withStatusMessages([]);
                        if (Array.isArray(update)) {
                            result = result.withValidationMessages(update);
                        }
                        else if (typeof update === 'function') {
                            result = update(result, _this);
                        }
                        return result;
                    }, function () {
                        return validatedModel.withValidationMessages([
                            { property: "", msg: "internal error (page transition handler)", code: 'transition-error', severity: metamodel_1.MessageSeverity.ERROR }
                        ]);
                    });
                }
                else {
                    promise = Promise.resolve(validatedModel);
                }
                return promise.then(function (serverValidatedModel) {
                    if (step < 0 || serverValidatedModel.isPageValid(null)) {
                        var nextPageModel = serverValidatedModel.changePage(step);
                        return nextPageModel;
                    }
                    else {
                        console.log("failed page transition", _this);
                        if (_this._config.onFailedPageTransition) {
                            _this._config.onFailedPageTransition(_this);
                        }
                    }
                    return serverValidatedModel;
                });
            }
            return validatedModel;
        })
            .then(function (x) { return _this._updateViewModel(x); })
            .then(function () {
            if (_this._config.onAfterPageTransition) {
                _this._config.onAfterPageTransition(_this);
            }
        });
        this._promiseInFlight(promise);
    };
    MetaFormContext.prototype.isBusy = function () {
        return this._promises.length > 0 && Date.now() > this._promisesBusyTime;
    };
    MetaFormContext.prototype._promiseInFlight = function (promise) {
        var _this = this;
        var index = this._promises.indexOf(promise);
        if (-1 == index) {
            this._promises.push(promise);
            var remove = function (x) { return (_this._promiseResolved(promise), x); };
            promise.then(remove, remove);
            if (this._promises.length == 1) {
                var delay = this._config.busyDelayMS;
                this._promisesBusyTime = Date.now() + delay;
                this._promisesTimeout = setTimeout(this._notifyAll.bind(this), delay);
            }
        }
    };
    MetaFormContext.prototype._promiseResolved = function (promise) {
        var index = this._promises.indexOf(promise);
        if (-1 != index) {
            this._promises.splice(index, 1);
            if (this._promises.length === 0) {
                this._notifyAll(); // should have notified, anyway?
            }
        }
    };
    return MetaFormContext;
}(metamodel_1.ClientProps));
exports.MetaFormContext = MetaFormContext;
//# sourceMappingURL=form-context.js.map