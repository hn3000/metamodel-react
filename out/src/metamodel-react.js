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
exports.ClientProps = metamodel_2.ClientProps;
var es6_promise_1 = require('es6-promise');
var fields = require('./default-field-types');
var listenermanager_1 = require('./listenermanager');
var MetaFormContext = (function (_super) {
    __extends(MetaFormContext, _super);
    function MetaFormContext(config, metamodel, data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        _super.call(this);
        this._config = config;
        this._metamodel = metamodel;
        this._viewmodel = new metamodel_1.ModelView(metamodel, data);
        this.pageBack = listenermanager_1.clickHandler(this.updatePage, this, -1);
        this.pageNext = listenermanager_1.clickHandler(this.updatePage, this, +1);
        this._listeners = new listenermanager_1.ListenerManager();
        if (null != this._config.onFormInit) {
            var update = this._config.onFormInit(this);
            update.then(function (x) {
                if (typeof x === 'function') {
                    var updater = x;
                    _this.updateModelTransactional(updater);
                }
                else if (null != x) {
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
        this.updateModelTransactional(function (model) { return model.withChangedField(field, value); });
    };
    MetaFormContext.prototype.updateModelTransactional = function (updater) {
        var _this = this;
        var newModel = updater(this._viewmodel);
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
            nextModel = model.validateFull();
        }
        else {
            nextModel = model.validatePage();
        }
        nextModel
            .then(function (validatedModel) {
            if (step < 0 || validatedModel.isPageValid(null)) {
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
}(metamodel_1.ClientProps));
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
exports.MetaForm_ContextTypes = {
    formContext: React.PropTypes.shape({
        config: React.PropTypes.object,
        metamodel: React.PropTypes.object,
        viewmodel: React.PropTypes.object,
        currentPage: React.PropTypes.number,
        i18nData: React.PropTypes.object
    })
};
var MetaComponentBase = (function (_super) {
    __extends(MetaComponentBase, _super);
    function MetaComponentBase(props, context) {
        _super.call(this, props, context);
        this._unsubscribe = null;
    }
    Object.defineProperty(MetaComponentBase.prototype, "formContext", {
        get: function () {
            return this.props.context || this.context.formContext;
        },
        enumerable: true,
        configurable: true
    });
    MetaComponentBase.prototype._updatedState = function (context, initState) {
        var newState = {
            currentPage: context.currentPage
        };
        if (initState) {
            this.state = newState;
        }
        else {
            this.setState(newState);
        }
    };
    MetaComponentBase.prototype.componentDidMount = function () {
        var _this = this;
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = this.formContext.subscribe(function () {
            if (!_this._unsubscribe)
                return;
            _this._updatedState(_this.formContext);
            _this.forceUpdate();
        });
    };
    MetaComponentBase.prototype.componentWillUnmount = function () {
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = null;
    };
    MetaComponentBase.contextTypes = exports.MetaForm_ContextTypes;
    return MetaComponentBase;
}(React.Component));
exports.MetaComponentBase = MetaComponentBase;
var MetaForm = (function (_super) {
    __extends(MetaForm, _super);
    function MetaForm(props, context) {
        _super.call(this, props, context);
        //if (null == props.context ) console.log("no context found in context for MetaForm", props);
        if (null == this.formContext || null == this.formContext.metamodel) {
            console.log("missing context info in MetaForm", props, context);
        }
        this.state = {
            viewmodel: this.formContext.viewmodel,
            currentPage: this.formContext.currentPage
        };
    }
    MetaForm.prototype.getChildContext = function () {
        return {
            formContext: this.props.context
        };
    };
    MetaForm.prototype.render = function () {
        var Wrapper = this.formContext.config.wrappers.form;
        /*
        let adjustedChildren = React.Children.map(this.props.children,
          (c) => React.cloneElement(c, {context: this.props.context}));
        */
        return (React.createElement(Wrapper, null, 
            React.createElement("form", {id: this.formContext.metamodel.name}, this.props.children)
        ));
    };
    MetaForm.prototype._updateState = function (context) {
        this.setState({
            viewmodel: context.viewmodel,
            currentPage: context.currentPage
        });
    };
    MetaForm.childContextTypes = MetaComponentBase.contextTypes;
    return MetaForm;
}(MetaComponentBase));
exports.MetaForm = MetaForm;
var MetaPage = (function (_super) {
    __extends(MetaPage, _super);
    function MetaPage(props, context) {
        _super.call(this, props, context);
        if (null == this.formContext || null == this.formContext.metamodel) {
            console.log("missing context info in MetaForm", props, context);
        }
    }
    MetaPage.prototype.render = function () {
        var context = this.formContext;
        if (this.props.page == context.currentPage) {
            var Wrapper = this.formContext.config.wrappers.page;
            return React.createElement(Wrapper, null, this.props.children);
        }
        return null;
    };
    MetaPage.prototype._updatedState = function (context, initState) {
        var result = {
            currentPage: this.formContext.currentPage
        };
        if (initState) {
            this.state = result;
        }
        else {
            this.setState(result);
        }
        return result;
    };
    MetaPage.contextTypes = exports.MetaForm_ContextTypes;
    return MetaPage;
}(MetaComponentBase));
exports.MetaPage = MetaPage;
function changeHandler(context, fieldName) {
    return function (evt) {
        var target = evt.target;
        if (target.type === "checkbox") {
            context.updateModel(fieldName, target.checked);
        }
        else {
            context.updateModel(fieldName, target.value);
        }
    };
}
var MetaInput = (function (_super) {
    __extends(MetaInput, _super);
    function MetaInput(props, context) {
        _super.call(this, props, context);
        if (null == this.formContext)
            console.log("no context found for MetaInput", props);
        this._updatedState(this.formContext, true);
    }
    MetaInput.prototype.render = function () {
        var context = this.formContext;
        var fieldName = this.props.field;
        var fieldType = context.metamodel.subModel(fieldName);
        var field = fieldType && fieldType.asItemType();
        if (!field) {
            console.log("field " + fieldName + " not found in " + context.metamodel.name);
            return null;
        }
        var formid = this.formContext.metamodel.name;
        var props = {
            id: formid + '#' + this.props.field,
            field: this.props.field,
            fieldType: fieldType,
            editable: context.viewmodel.isFieldEditable(this.props.field),
            hasErrors: (0 < this.state.fieldErrors.length),
            errors: this.state.fieldErrors,
            value: this.state.fieldValue || "",
            defaultValue: this.state.fieldValue || "",
            onChange: changeHandler(context, fieldName),
            context: context
        };
        var flavor = this.props.flavor || this.props.flavour;
        var Wrapper = context.config.wrappers.field;
        if (this.props.hasOwnProperty('wrapper')) {
            Wrapper = this.props.wrapper;
        }
        var children;
        var Input;
        if (0 === React.Children.count(this.props.children)) {
            Input = context.config.findBest(field, fieldName, flavor);
            children = [React.createElement(Input, __assign({}, props))];
        }
        else {
            children = React.Children.map(this.props.children, function (c) {
                // avoid providing our props to html elements
                if (typeof (c.type) === 'string')
                    return c;
                return React.cloneElement(c, props);
            });
        }
        if (Wrapper) {
            return React.createElement(Wrapper, __assign({}, props), children);
        }
        else {
            return React.createElement("div", null, children);
        }
    };
    MetaInput.prototype._updatedState = function (context, initState) {
        var fieldName = this.props.field;
        var result = {
            fieldErrors: context.viewmodel.getFieldMessages(fieldName),
            fieldValue: context.viewmodel.getFieldValue(fieldName)
        };
        if (initState) {
            this.state = result;
        }
        else {
            this.setState(result);
        }
    };
    return MetaInput;
}(MetaComponentBase));
exports.MetaInput = MetaInput;
//# sourceMappingURL=metamodel-react.js.map