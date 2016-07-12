/* /// <reference path="../typings/index.d.ts" /> */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require('react');
var metamodel_1 = require('@hn3000/metamodel');
var metamodel_2 = require('@hn3000/metamodel');
exports.ValidationScope = metamodel_2.ValidationScope;
exports.ModelView = metamodel_2.ModelView;
var es6_promise_1 = require('es6-promise');
var fields = require('./default-field-types');
var listenermanager_1 = require('./listenermanager');
var MetaFormContext = (function () {
    function MetaFormContext(config, metamodel, data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        this._config = config;
        this._metamodel = metamodel;
        this._viewmodel = new metamodel_1.ModelView(metamodel, data);
        this.pageBack = listenermanager_1.clickHandler(this.updatePage, this, -1);
        this.pageNext = listenermanager_1.clickHandler(this.updatePage, this, +1);
        this._listeners = new listenermanager_1.ListenerManager();
        if (null != this._config.onFormInit) {
            var update = this._config.onFormInit(this);
            update.then(function (x) {
                if (x) {
                    _this._updateViewModel(_this._viewmodel.withAddedData(x));
                }
            });
        }
    }
    MetaFormContext.prototype.pageNextAllowed = function () {
        var vm = this._viewmodel;
        var hasNext = vm.currentPageIndex < vm.getPages().length;
        return hasNext && vm.isPageValid(null);
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
        var _this = this;
        var newModel = this._viewmodel.withChangedField(field, value);
        this._updateViewModel(newModel);
        if (this._config.validateOnUpdate || newModel.validationScope() != metamodel_1.ValidationScope.VISITED) {
            var validated = newModel.validateDefault();
            validated.then(function (x) { return _this._updateViewModel(x); });
        }
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
            nextModel = es6_promise_1.Promise.resolve(model);
        }
        else if (model.currentPageNo == model.getPages().length) {
            nextModel = model.validatePage(); //model.validateAll();
        }
        else {
            nextModel = model.validatePage();
        }
        nextModel
            .then(function (validatedModel) {
            if (validatedModel.isPageValid(null)) {
                var promise;
                if (_this._config.onPageTransition) {
                    // this._viewmodel = validatedModel; ??
                    var moreValidation = _this._config.onPageTransition(_this, step);
                    promise = moreValidation.then(function (messages) {
                        var result = validatedModel;
                        if (messages && messages.length) {
                            result = validatedModel.withValidationMessages(messages);
                        }
                        return result;
                    }, function () {
                        return validatedModel.withValidationMessages([
                            { path: "", msg: "server communication failed", isError: true }
                        ]);
                    });
                }
                else {
                    promise = es6_promise_1.Promise.resolve(validatedModel);
                }
                return promise.then(function (serverValidatedModel) {
                    if (step < 0 || serverValidatedModel.isPageValid(null)) {
                        return serverValidatedModel.changePage(step);
                    }
                    return serverValidatedModel;
                });
            }
            return validatedModel;
        })
            .then(function (x) { return _this._updateViewModel(x); });
    };
    return MetaFormContext;
}());
exports.MetaFormContext = MetaFormContext;
function objMatcher(template) {
    var keys = Object.keys(template);
    var n = keys.length;
    return (function (field /*</any>*/) {
        var result = 0;
        var fieldObj = field;
        for (var i = 0; i < n; i++) {
            var k = keys[i];
            if (fieldObj[k] == template[k]) {
                ++result;
            }
        }
        return result;
    });
}
function kindMatcher(kind) {
    return function (field) { return (field.kind === kind ? 1 : 0); };
}
function andMatcher() {
    var matcher = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        matcher[_i - 0] = arguments[_i];
    }
    return function (field) { return matcher.reduce(function (q, m) {
        var qq = m(field);
        return qq && q + qq;
    }, 0); };
}
function hasPVC(from, to) {
    return function (field) {
        var pv = field.asItemType() && field.asItemType().possibleValues();
        var pvc = pv ? pv.length : 0;
        if ((pvc >= from) && (!to || pvc < to)) {
            return 1;
        }
        return 0;
    };
}
var MetaFormConfig = (function () {
    function MetaFormConfig(wrappers, components) {
        this.usePageIndex = false;
        this.validateOnUpdate = false;
        this.onFormInit = null; // </any>
        this.onPageTransition = null; // </IValidationMessage>
        this._wrappers = wrappers || MetaFormConfig.defaultWrappers();
        this._components = components || MetaFormConfig.defaultComponents();
    }
    MetaFormConfig.prototype.setWrappers = function (wrappers) {
        this._wrappers = wrappers;
    };
    Object.defineProperty(MetaFormConfig.prototype, "wrappers", {
        get: function () {
            return this._wrappers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaFormConfig.prototype, "matchers", {
        get: function () {
            return this._components;
        },
        enumerable: true,
        configurable: true
    });
    MetaFormConfig.prototype.findBest = function (type, fieldName, flavor) {
        var matchargs = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            matchargs[_i - 3] = arguments[_i];
        }
        var bestQ = 0;
        var match = fields.MetaFormUnknownFieldType;
        var matchers = this._components;
        for (var i = 0, n = matchers.length; i < n; ++i) {
            var thisQ = (_a = matchers[i]).matchQuality.apply(_a, [type, fieldName, flavor].concat(matchargs));
            if (thisQ > bestQ) {
                match = matchers[i].component;
                bestQ = thisQ;
            }
        }
        return match;
        var _a;
    };
    MetaFormConfig.prototype.add = function (cm) {
        if (-1 == this._components.indexOf(cm)) {
            this._components.push(cm);
        }
    };
    MetaFormConfig.prototype.remove = function (cm) {
        this._components = this._components.filter(function (x) { return x != cm; });
    };
    MetaFormConfig.defaultWrappers = function () {
        return {
            form: fields.FormWrapper,
            page: fields.PageWrapper,
            field: fields.FieldWrapper,
        };
    };
    MetaFormConfig.defaultComponents = function () {
        return [
            {
                matchQuality: kindMatcher('string'),
                component: fields.MetaFormInputString
            },
            {
                matchQuality: kindMatcher('number'),
                component: fields.MetaFormInputNumber
            },
            {
                matchQuality: kindMatcher('bool'),
                component: fields.MetaFormInputBool
            },
            {
                matchQuality: objMatcher({ kind: 'bool' }),
                component: fields.MetaFormInputBool
            },
            {
                matchQuality: andMatcher(kindMatcher('string'), hasPVC(10)),
                component: fields.MetaFormInputEnumSelect
            },
            {
                matchQuality: andMatcher(kindMatcher('string'), hasPVC(2, 10)),
                component: fields.MetaFormInputEnumRadios
            },
            {
                matchQuality: andMatcher(kindMatcher('string'), hasPVC(1, 2)),
                component: fields.MetaFormInputEnumCheckbox
            }
        ];
    };
    return MetaFormConfig;
}());
exports.MetaFormConfig = MetaFormConfig;
var MetaFormBase = (function (_super) {
    __extends(MetaFormBase, _super);
    function MetaFormBase(props, state) {
        _super.call(this, props, state);
        this._unsubscribe = null;
    }
    MetaFormBase.prototype._updateState = function (context) {
        var newState = {
            currentPage: context.currentPage
        };
        this.setState(newState);
    };
    MetaFormBase.prototype.componentDidMount = function () {
        var _this = this;
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = this.props.context.subscribe(function () {
            if (!_this._unsubscribe)
                return;
            _this._updateState(_this.props.context);
        });
    };
    MetaFormBase.prototype.componentWillUnmount = function () {
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = null;
    };
    return MetaFormBase;
}(React.Component));
exports.MetaFormBase = MetaFormBase;
var MetaForm = (function (_super) {
    __extends(MetaForm, _super);
    //childContextTypes = {
    //  formcontext: React.PropTypes.object
    //}
    //getChildContext() {
    //  return { formcontext: this.props.context };
    //}
    function MetaForm(props, context) {
        _super.call(this, props, context);
        this.state = {
            viewmodel: this.props.context.viewmodel,
            currentPage: this.props.context.currentPage
        };
    }
    MetaForm.prototype.render = function () {
        var Wrapper = this.props.context.config.wrappers.form;
        /*
        let adjustedChildren = React.Children.map(this.props.children,
          (c) => React.cloneElement(c, {context: this.props.context}));
        */
        return (React.createElement(Wrapper, null, 
            React.createElement("form", {id: this.props.context.metamodel.name}, this.props.children)
        ));
    };
    MetaForm.prototype._updateState = function (context) {
        this.setState({
            viewmodel: context.viewmodel,
            currentPage: context.currentPage
        });
    };
    return MetaForm;
}(MetaFormBase));
exports.MetaForm = MetaForm;
var MetaPage = (function (_super) {
    __extends(MetaPage, _super);
    function MetaPage(props, context) {
        _super.call(this, props, context);
        this.state = {
            currentPage: this.props.context.currentPage
        };
    }
    MetaPage.prototype.render = function () {
        //let context = this.context.formcontext || this.props.context;
        var context = this.props.context;
        if (this.props.page == context.currentPage) {
            var Wrapper = this.props.context.config.wrappers.page;
            return React.createElement(Wrapper, null, this.props.children);
        }
        return null;
    };
    MetaPage.prototype.componentDidMount = function () {
        var _this = this;
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = this.props.context.subscribe(function () {
            _this.setState({
                currentPage: _this.props.context.currentPage
            });
        });
    };
    MetaPage.prototype.componentWillUnmount = function () {
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = null;
    };
    return MetaPage;
}(React.Component));
exports.MetaPage = MetaPage;
function changeHandler(model, fieldName) {
    return function (event) {
        var target = event.target;
        if (target.type === "checkbox") {
            model.updateModel(fieldName, target.checked);
        }
        else {
            model.updateModel(fieldName, target.value);
        }
    };
}
var MetaInput = (function (_super) {
    __extends(MetaInput, _super);
    function MetaInput(props, context) {
        _super.call(this, props, context);
        this.state = this._updatedState();
    }
    MetaInput.prototype.render = function () {
        var context = this.props.context;
        var fieldName = this.props.field;
        var fieldType = context.metamodel.subModel(fieldName);
        var field = fieldType && fieldType.asItemType();
        if (!field) {
            console.log("field " + fieldName + " not found in " + context.metamodel.name);
            return null;
        }
        var formid = this.props.context.metamodel.name;
        var props = {
            id: formid + '#' + this.props.field,
            field: this.props.field,
            fieldType: fieldType,
            hasErrors: (0 < this.state.fieldErrors.length),
            errors: this.state.fieldErrors,
            value: this.state.fieldValue || "",
            defaultValue: this.state.fieldValue || "",
            onChange: changeHandler(context, fieldName),
            context: context
        };
        var flavor = this.props.flavor || this.props.flavour;
        var Wrapper = context.config.wrappers.field;
        var Input;
        if (0 === React.Children.count(this.props.children)) {
            Input = context.config.findBest(field, fieldName, flavor);
            return React.createElement(Wrapper, __assign({}, props), 
                React.createElement(Input, __assign({}, props))
            );
        }
        else {
            var children = React.Children.map(this.props.children, function (c) {
                // avoid providing our props to html elements
                if (typeof (c.type) === 'string')
                    return c;
                return React.cloneElement(c, props);
            });
            return React.createElement(Wrapper, __assign({}, props), children);
        }
    };
    MetaInput.prototype.componentDidMount = function () {
        var _this = this;
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = this.props.context.subscribe(function () {
            if (!_this._unsubscribe)
                return;
            _this.setState(_this._updatedState());
        });
    };
    MetaInput.prototype.componentWillUnmount = function () {
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = null;
    };
    MetaInput.prototype._updatedState = function () {
        var context = this.props.context;
        var fieldName = this.props.field;
        var result = {
            fieldErrors: context.viewmodel.getFieldMessages(fieldName),
            fieldValue: context.viewmodel.getFieldValue(fieldName)
        };
        return result;
    };
    return MetaInput;
}(React.Component));
exports.MetaInput = MetaInput;
//# sourceMappingURL=metamodel-react.js.map