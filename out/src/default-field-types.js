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
var FieldWrapper = (function (_super) {
    __extends(FieldWrapper, _super);
    function FieldWrapper() {
        _super.apply(this, arguments);
    }
    FieldWrapper.prototype.render = function () {
        var props = {};
        if (this.props.hasErrors) {
            props['className'] = 'has-error';
        }
        return React.createElement("div", __assign({}, props), this.props.children);
    };
    return FieldWrapper;
}(React.Component));
exports.FieldWrapper = FieldWrapper;
var PageWrapper = (function (_super) {
    __extends(PageWrapper, _super);
    function PageWrapper() {
        _super.apply(this, arguments);
    }
    PageWrapper.prototype.render = function () {
        return React.createElement("div", null, this.props.children);
    };
    return PageWrapper;
}(React.Component));
exports.PageWrapper = PageWrapper;
var FormWrapper = (function (_super) {
    __extends(FormWrapper, _super);
    function FormWrapper() {
        _super.apply(this, arguments);
    }
    FormWrapper.prototype.render = function () {
        return React.createElement("div", null, this.props.children);
    };
    return FormWrapper;
}(React.Component));
exports.FormWrapper = FormWrapper;
var MetaFormInputString = (function (_super) {
    __extends(MetaFormInputString, _super);
    function MetaFormInputString() {
        _super.apply(this, arguments);
    }
    MetaFormInputString.prototype.render = function () {
        var props = this.props;
        return React.createElement("input", {type: "text", placeholder: props.field, onChange: props.onChange, value: props.value});
    };
    return MetaFormInputString;
}(React.Component));
exports.MetaFormInputString = MetaFormInputString;
var MetaFormInputNumber = (function (_super) {
    __extends(MetaFormInputNumber, _super);
    function MetaFormInputNumber() {
        _super.apply(this, arguments);
    }
    MetaFormInputNumber.prototype.render = function () {
        var props = this.props;
        return React.createElement("input", {type: "text", placeholder: this.props.field, onChange: props.onChange, value: props.value});
    };
    return MetaFormInputNumber;
}(React.Component));
exports.MetaFormInputNumber = MetaFormInputNumber;
var MetaFormInputBool = (function (_super) {
    __extends(MetaFormInputBool, _super);
    function MetaFormInputBool() {
        _super.apply(this, arguments);
    }
    MetaFormInputBool.prototype.render = function () {
        var props = this.props;
        return React.createElement("input", {type: "checkbox", onChange: props.onChange, value: props.value});
    };
    return MetaFormInputBool;
}(React.Component));
exports.MetaFormInputBool = MetaFormInputBool;
var MetaFormInputEnum = (function (_super) {
    __extends(MetaFormInputEnum, _super);
    function MetaFormInputEnum() {
        _super.apply(this, arguments);
    }
    MetaFormInputEnum.prototype.render = function () {
        var props = this.props;
        var fieldType = props.fieldType;
        var itemType = fieldType.asItemType();
        var values = ["a", "b"];
        if (null != itemType) {
        }
        return (React.createElement("select", {onChange: props.onChange, value: props.value}, values.map(function (x) { return (React.createElement("option", {value: x}, "x")); })));
    };
    return MetaFormInputEnum;
}(React.Component));
exports.MetaFormInputEnum = MetaFormInputEnum;
var MetaFormUnknownFieldType = (function (_super) {
    __extends(MetaFormUnknownFieldType, _super);
    function MetaFormUnknownFieldType() {
        _super.apply(this, arguments);
    }
    MetaFormUnknownFieldType.prototype.render = function () {
        return React.createElement("input", {type: "text", placeholder: this.props.field + ": unknown kind"});
    };
    return MetaFormUnknownFieldType;
}(React.Component));
exports.MetaFormUnknownFieldType = MetaFormUnknownFieldType;
//# sourceMappingURL=default-field-types.js.map