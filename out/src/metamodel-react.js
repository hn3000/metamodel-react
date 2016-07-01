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
var es6_promise_1 = require('es6-promise');
var fields = require('./default-field-types');
var listenermanager_1 = require('./listenermanager');
var MetaFormContext = (function () {
    function MetaFormContext(config, metamodel, data) {
        if (data === void 0) { data = {}; }
        this._config = config;
        this._metamodel = metamodel;
        this._viewmodel = new metamodel_1.ModelView(metamodel, data);
        this._currentPage = 1;
        this.pageBack = listenermanager_1.clickHandler(this.updatePage, this, -1);
        this.pageNext = listenermanager_1.clickHandler(this.updatePage, this, +1);
        this._listeners = new listenermanager_1.ListenerManager();
        this._validators = new listenermanager_1.ListenerManager();
        this._pageValidators = new listenermanager_1.ListenerManager();
    }
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
            return this._currentPage;
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
    MetaFormContext.prototype.addValidator = function (validator) {
        return this._validators.subscribe(validator);
    };
    MetaFormContext.prototype.addPageValidator = function (validator) {
        return this._validators.subscribe(validator);
    };
    MetaFormContext.prototype.updateModel = function (field, value) {
        var _this = this;
        this._viewmodel = this._viewmodel.withChangedField(field, value);
        this._runValidation().then(function () { return _this._listeners.forEach(function (x) { return x(); }); });
    };
    MetaFormContext.prototype.updatePage = function (step) {
        if (step > 0) {
        }
        this._currentPage += step;
        this._listeners.forEach(function (x) { return x(); });
    };
    MetaFormContext.prototype._runValidation = function () {
        return es6_promise_1.Promise.resolve(null);
    };
    return MetaFormContext;
}());
exports.MetaFormContext = MetaFormContext;
function objMatcher(template) {
    var keys = Object.keys(template);
    var n = keys.length;
    return (function (field) {
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
var MetaFormConfig = (function () {
    function MetaFormConfig(wrappers, components) {
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
    MetaFormConfig.prototype.findBest = function () {
        var matchargs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            matchargs[_i - 0] = arguments[_i];
        }
        var bestQ = 0;
        var match = fields.MetaFormUnknownFieldType;
        var matchers = this._components;
        for (var i = 0, n = matchers.length; i < n; ++i) {
            var thisQ = (_a = matchers[i]).matchQuality.apply(_a, matchargs);
            if (thisQ > bestQ) {
                match = matchers[i].component;
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
            }
        ];
    };
    return MetaFormConfig;
}());
exports.MetaFormConfig = MetaFormConfig;
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
        this._unsubscribe = null;
    }
    MetaForm.prototype.render = function () {
        var Wrapper = this.props.context.config.wrappers.form;
        /*
        let adjustedChildren = React.Children.map(this.props.children,
          (c) => React.cloneElement(c, {context: this.props.context}));
        */
        return (React.createElement(Wrapper, null, React.createElement("form", {id: this.props.context.metamodel.name}, this.props.children)));
    };
    MetaForm.prototype.componentDidMount = function () {
        var _this = this;
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = this.props.context.subscribe(function () {
            _this.setState({
                viewmodel: _this.props.context.viewmodel,
                currentPage: _this.props.context.currentPage
            });
        });
    };
    MetaForm.prototype.componentWillUnmount = function () {
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = null;
    };
    return MetaForm;
}(React.Component));
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
        model.updateModel(fieldName, target.value);
    };
}
var MetaInput = (function (_super) {
    __extends(MetaInput, _super);
    function MetaInput() {
        _super.apply(this, arguments);
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
        var props = {
            field: this.props.field,
            fieldType: fieldType,
            value: context.viewmodel.getFieldValue(fieldName),
            onChange: changeHandler(context, fieldName)
        };
        var Input = context.config.findBest(field, fieldName);
        var Wrapper = context.config.wrappers.field;
        return React.createElement(Wrapper, null, React.createElement(Input, __assign({}, props)));
    };
    return MetaInput;
}(React.Component));
exports.MetaInput = MetaInput;
//# sourceMappingURL=metamodel-react.js.map