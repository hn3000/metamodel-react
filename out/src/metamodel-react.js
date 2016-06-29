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
var fields = require('./default-field-types');
var ViewModel = (function () {
    function ViewModel(metamodel) {
        this._metamodel = metamodel;
    }
    return ViewModel;
}());
exports.ViewModel = ViewModel;
function kindMatcher(kind) {
    return function (field) { return (field.kind === kind ? 1 : 0); };
}
var MetaFormConfig = (function () {
    function MetaFormConfig() {
        this._wrappers = {
            form: fields.FormWrapper,
            page: fields.PageWrapper,
            field: fields.FieldWrapper,
        };
        this._matchers = [
            {
                matchQuality: kindMatcher('string'),
                component: fields.MetaFormInputString
            },
            {
                matchQuality: kindMatcher('number'),
                component: fields.MetaFormInputNumber
            }
        ];
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
            return this._matchers;
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
        var matchers = this._matchers;
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
        if (-1 == this._matchers.indexOf(cm)) {
            this._matchers.push(cm);
        }
    };
    MetaFormConfig.prototype.remove = function (cm) {
        this._matchers = this._matchers.filter(function (x) { return x != cm; });
    };
    return MetaFormConfig;
}());
exports.MetaFormConfig = MetaFormConfig;
var MetaForm = (function (_super) {
    __extends(MetaForm, _super);
    function MetaForm() {
        _super.apply(this, arguments);
    }
    //childContextTypes = {
    //  formcontext: React.PropTypes.object
    //}
    //getChildContext() {
    //  return { formcontext: this.props.context };
    //}
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
    return MetaForm;
}(React.Component));
exports.MetaForm = MetaForm;
var MetaPage = (function (_super) {
    __extends(MetaPage, _super);
    function MetaPage() {
        _super.apply(this, arguments);
    }
    //contextProps: { formcontext: React.PropTypes.object }
    MetaPage.prototype.render = function () {
        //let context = this.context.formcontext || this.props.context;
        var context = this.props.context;
        if (this.props.page == this.props.currentPage) {
            var Wrapper = this.props.context.config.wrappers.page;
            return React.createElement(Wrapper, null, this.props.children);
        }
        return null;
    };
    return MetaPage;
}(React.Component));
exports.MetaPage = MetaPage;
var MetaInput = (function (_super) {
    __extends(MetaInput, _super);
    function MetaInput() {
        _super.apply(this, arguments);
    }
    MetaInput.prototype.render = function () {
        var fieldName = this.props.field;
        var fieldType = this.props.context.metamodel.subModel(fieldName);
        var field = fieldType && fieldType.asItemType();
        if (!field) {
            console.log("field " + fieldName + " not found in " + this.props.context.metamodel.name);
            return null;
        }
        var Input = this.props.context.config.findBest(field, fieldName);
        var Wrapper = this.props.context.config.wrappers.field;
        return React.createElement(Wrapper, null, 
            React.createElement(Input, __assign({}, this.props))
        );
    };
    return MetaInput;
}(React.Component));
exports.MetaInput = MetaInput;
//# sourceMappingURL=metamodel-react.js.map