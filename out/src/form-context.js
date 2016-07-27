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
        var page = null != overridePage ? overridePage - (config.usePageIndex ? 0 : 1) : -1;
        this._viewmodel = new metamodel_1.ModelView(metamodel, data, page);
        this.pageBack = listener_manager_1.clickHandler(this.updatePage, this, -1);
        this.pageNext = listener_manager_1.clickHandler(this.updatePage, this, +1);
        this._listeners = new listener_manager_1.ListenerManager();
        if (null != this._config.onFormInit) {
            var update = this._config.onFormInit(this);
            update.then(function (x) {
                var model = _this._viewmodel;
                if (typeof x === 'function') {
                    var clientUpdate = x;
                    model = clientUpdate(model);
                }
                else if (null != x) {
                    model = model.withAddedData(x);
                }
                if (null == overridePage) {
                    model = model.changePage(1);
                }
                _this._updateViewModel(model);
            });
        }
    }
    MetaFormContext.prototype.pageNextAllowed = function () {
        var vm = this._viewmodel;
        var hasNext = vm.currentPageIndex < vm.getPages().length;
        var config = this._config;
        var validating = (config.validateOnUpdateIfInvalid
            || config.validateOnUpdateIfInvalid) && !config.allowNextWhenInvalid;
        return hasNext && (!validating || vm.isPageValid(null));
    };
    MetaFormContext.prototype.pageBackAllowed = function () {
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
    MetaFormContext.prototype.updateModelTransactional = function (updater) {
        var _this = this;
        var newModel = updater(this._viewmodel);
        var config = this._config;
        var nextUpdate = Promise.resolve(function (x) { return x; });
        if (config.onModelUpdate) {
            this._viewmodel = newModel;
            nextUpdate = config.onModelUpdate(this);
        }
        nextUpdate.then(function (updater) {
            var updatedModel = updater(newModel);
            _this._updateViewModel(updatedModel);
            var needsValidation = config.validateOnUpdate;
            if (!needsValidation && config.validateOnUpdateIfInvalid) {
                needsValidation = !newModel.isValid();
            }
            if (needsValidation) {
                var validator = function () {
                    var validated = _this._viewmodel.validateDefault();
                    validated.then(function (x) { return _this._updateViewModel(x); });
                    _this._debounceValidationTimeout = null;
                };
                if (_this._debounceValidationTimeout) {
                    clearTimeout(_this._debounceValidationTimeout);
                }
                _this._debounceValidationTimeout = setTimeout(validator, config.validateDebounceTime);
            }
        });
    };
    MetaFormContext.prototype._updateViewModel = function (viewmodel) {
        this._viewmodel = viewmodel;
        this._notifyAll();
    };
    MetaFormContext.prototype._notifyAll = function () {
        this._listeners.forEach(function (x) { return x(); });
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
        nextModel
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
                    // so onPageTransition starts with this one
                    _this._viewmodel = validatedModel;
                    var moreValidation = _this._config.onPageTransition(_this, step);
                    promise = moreValidation.then(function (messages) {
                        var result = validatedModel;
                        if (messages && messages.length) {
                            result = validatedModel.withValidationMessages(messages);
                        }
                        return result;
                    }, function () {
                        return validatedModel.withValidationMessages([
                            { path: "", msg: "internal error (page transition handler)", code: 'transition-error', isError: true }
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
    };
    return MetaFormContext;
}(metamodel_1.ClientProps));
exports.MetaFormContext = MetaFormContext;
//# sourceMappingURL=form-context.js.map