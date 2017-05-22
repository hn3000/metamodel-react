"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var metamodel_1 = require("@hn3000/metamodel");
var listener_manager_1 = require("./listener-manager");
var search_params_1 = require("./search-params");
var requestParams = search_params_1.parseSearchParams(location.search);
var overridePage = requestParams.page != null ? +(requestParams.page) : null;
var PAGE_INIT = -1;
var MetaFormContext = (function (_super) {
    __extends(MetaFormContext, _super);
    function MetaFormContext(config, metamodel, data) {
        if (data === void 0) { data = {}; }
        var _this = _super.call(this) || this;
        _this._config = config;
        _this._metamodel = metamodel;
        var page = null != overridePage ? overridePage - (config.usePageIndex ? 0 : 1) : PAGE_INIT;
        _this._viewmodel = new metamodel_1.ModelView(metamodel, data, page);
        _this.pageBack = listener_manager_1.clickHandler(_this.updatePage, _this, -1);
        _this.pageNext = listener_manager_1.clickHandler(_this.updatePage, _this, +1);
        _this._listeners = new listener_manager_1.ListenerManager();
        _this._promises = [];
        if (null != _this._config.onFormInit) {
            var update = Promise.resolve(_this)
                .then(function (ctx) { return _this._config.onFormInit(ctx); });
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
            _this._promiseInFlight(update);
        }
        return _this;
    }
    MetaFormContext.prototype.hasNextPage = function () {
        var vm = this._viewmodel;
        return vm.currentPageIndex < vm.getPages().length;
    };
    MetaFormContext.prototype.hasPreviousPage = function () {
        var vm = this._viewmodel;
        return vm.currentPageIndex > 0 && !this.isFinished();
    };
    MetaFormContext.prototype.isFinished = function () {
        return null != this._conclusion || !this.hasNextPage();
    };
    MetaFormContext.prototype.isValid = function () {
        return this._viewmodel.arePagesUpToCurrentValid();
    };
    MetaFormContext.prototype.isPageValid = function () {
        return this._viewmodel.isPageValid();
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
        var _this = this;
        /*if (null != this._conclusion && this._conclusion !== conclusion) {
          throw new Error(`form already has a conclusion: ${this._conclusion} ${conclusion}`);
        }*/
        this._conclusion = conclusion;
        // ensure page reflects that the form is concluded
        var endPage = this._viewmodel.getPages().length;
        if (this.currentPage != endPage) {
            Promise.resolve().then(function () {
                if (_this.currentPage != endPage) {
                    _this._updateViewModel(_this._viewmodel.gotoPage(endPage));
                }
            }).then(null, function (xx) { return (console.log('unhandled exception', xx), null); });
        }
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
        if (this.isBusy()) {
            //let error = new Error('causality violation: updateModelTransactional not allowed while already busy');
            console.warn('updateModelTransactional called while busy, deferring action');
            Promise.all(this._promises).then(function () {
                console.log('updateModelTransactional - next attempt, busy: ', _this.isBusy());
                _this.updateModelTransactional(updater, skipValidation);
            });
            return;
        }
        var newModel = updater(this._viewmodel, this);
        var config = this._config;
        //this._viewmodel = newModel;
        this._updateViewModel(newModel);
        var nextUpdate = Promise.resolve(function (x, c) { return x; });
        if (config.onModelUpdate) {
            nextUpdate = nextUpdate.then(function () { return config.onModelUpdate(_this); });
        }
        nextUpdate.then(function (updater2) {
            var updatedModel = updater2(newModel, _this);
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
        if (this._viewmodel.currentPageIndex > viewmodel.currentPageIndex) {
            try {
                throw new Error('stacktrace for debugging');
            }
            catch (xx) {
                console.debug(xx);
            }
        }
        this._viewmodel = viewmodel;
        this._notifyAll();
    };
    MetaFormContext.prototype._notifyAll = function () {
        console.log('notify all', this._viewmodel.currentPageIndex);
        this._listeners.all.forEach(function (x) { return x(); });
        console.log('/notify all');
    };
    MetaFormContext.prototype.updatePage = function (step) {
        var _this = this;
        var originalModel = this._viewmodel;
        var nextModel;
        if (step < 0) {
            nextModel = Promise.resolve(originalModel);
        }
        else if (originalModel.currentPageNo == originalModel.getPages().length) {
            nextModel = originalModel.validateFull();
        }
        else {
            nextModel = originalModel.validatePage();
        }
        var promise = nextModel
            .then(function (validatedModel) {
            var isSubmit = originalModel.currentPageNo == originalModel.getPages().length;
            var override = _this._config.allowNavigationWithInvalidPages;
            if (step < 0 || override || validatedModel.isPageValid(null)) {
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
                    if (step < 0 || (serverValidatedModel.isPageValid(null)
                        && 0 == serverValidatedModel.getStatusMessages().length)) {
                        var nextPageModel = serverValidatedModel.changePage(step);
                        return nextPageModel;
                    }
                    if (serverValidatedModel.currentPageIndex == originalModel.currentPageIndex) {
                        console.log("failed page transition", _this);
                    }
                    return serverValidatedModel;
                });
            }
            return validatedModel;
        })
            .then(function (x) { return _this._updateViewModel(x); })
            .then(function () {
            var currentIndex = _this._viewmodel.currentPageIndex;
            if (originalModel.currentPageIndex == currentIndex) {
                if (_this._config.onFailedPageTransition) {
                    _this._config.onFailedPageTransition(_this);
                }
            }
            else {
                if (_this._config.onAfterPageTransition) {
                    _this._config.onAfterPageTransition(_this);
                }
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
            var remove_1 = function (x) { return (_this._promiseResolved(promise), x); };
            var removeX = function (x) { return (console.log('promise unhandled exception', x), remove_1(x)); };
            promise.then(remove_1, removeX);
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