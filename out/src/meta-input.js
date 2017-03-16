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
var base_components_1 = require("./base-components");
var React = require("react");
var MetaInput = (function (_super) {
    __extends(MetaInput, _super);
    function MetaInput(props, context) {
        var _this = _super.call(this, props, context) || this;
        if (null == _this.formContext)
            console.log("no context found for MetaInput", props);
        _this.initialContext(_this.formContext);
        _this.changeHandler = _this.changeHandler.bind(_this);
        _this.nochangeHandler = _this.nochangeHandler.bind(_this);
        return _this;
    }
    MetaInput.prototype.changeHandler = function (update) {
        var updateType = typeof update;
        var updateIsPrimitive = (updateType === 'string'
            || updateType === 'number'
            || updateType === 'boolean'
            || Array.isArray(update)
            || update == null);
        var newValue;
        if (updateIsPrimitive) {
            newValue = update;
        }
        else if (update.hasOwnProperty('target')) {
            var evt = update;
            var target = evt.target;
            if (target.type === "checkbox") {
                newValue = target.checked;
            }
            else {
                newValue = target.value;
            }
        }
        if (newValue === '') {
            newValue = null;
        }
        var context = this.formContext;
        var fieldName = this.props.field;
        var oldValue = null;
        if (null != this.props.onChange) {
            oldValue = context.viewmodel.getFieldValue(fieldName);
        }
        context.updateModel(fieldName, newValue);
        if (null != this.props.onChange) {
            var newValue_1 = context.viewmodel.getFieldValue(fieldName);
            if (newValue_1 !== oldValue) {
                this.props.onChange(context, fieldName, newValue_1, oldValue);
            }
        }
    };
    MetaInput.prototype.nochangeHandler = function () {
        // just a dummy to provide to the input
    };
    MetaInput.prototype.render = function () {
        var context = this.formContext;
        var fieldName = this.props.field;
        var fieldType = context.viewmodel.getFieldType(fieldName);
        if (!fieldType) {
            console.log("field " + fieldName + " not found in " + context.metamodel.name);
            return null;
        }
        var formid = this.formContext.metamodel.name;
        //let theValue = (undefined !== this.state.fieldValue) ? this.state.fieldValue : '';
        var viewmodel = context.viewmodel;
        var fieldErrors = viewmodel.getFieldMessages(fieldName);
        var modelValue = viewmodel.getFieldValue(fieldName);
        var fieldValue = modelValue;
        if (null == fieldValue) {
            switch (fieldType.kind) {
                case 'array':
                case 'object':
                    fieldValue = fieldType.create();
                    break;
                default:
                    fieldValue = "";
                    break;
            }
        }
        var isEditable = context.viewmodel.isFieldEditable(this.props.field);
        var props = {
            id: formid + '#' + this.props.field,
            field: this.props.field,
            fieldType: fieldType,
            editable: isEditable,
            hasErrors: (0 < this.state.fieldErrors.length),
            errors: fieldErrors,
            value: fieldValue,
            defaultValue: fieldValue,
            onChange: isEditable ? this.changeHandler : this.nochangeHandler,
            context: this.formContext
        };
        var flavor = this.props.flavor || this.props.flavour;
        var Wrapper = context.config.wrappers.field;
        if (this.props.hasOwnProperty('wrapper')) {
            Wrapper = this.props.wrapper;
        }
        var children;
        var Input;
        if (0 === React.Children.count(this.props.children)) {
            Input = context.config.findBest(fieldType, fieldName, flavor);
            children = [React.createElement(Input, __assign({ key: 0 }, props))];
        }
        else {
            children = React.Children.map(this.props.children, function (c) {
                // avoid providing our props to html elements or NPEs
                if (null == c || typeof (c.type) === 'string') {
                    return c;
                }
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
    /*
    shouldComponentUpdate(nextProps: IInputProps, nextState: any, nextCtx: any) {
      let nextContext = nextCtx.formContext as IFormContext;
      let thisContext = this.formContext;
  
      let field = this.props.field;
      let state = this.state;
      let newValue = nextContext.viewmodel.getFieldValue(field);
      let oldValue = state.fieldValue;
      let newErrors = nextContext.viewmodel.getFieldMessages(field);
      let oldErrors = state.fieldErrors;
  
      return newValue != oldValue || newErrors != oldErrors && newErrors.length > 0 && oldErrors.length > 0;
    }*/
    MetaInput.prototype._extractState = function (context) {
        var fieldName = this.props.field;
        var result = {
            fieldErrors: context.viewmodel.getFieldMessages(fieldName),
            fieldValue: context.viewmodel.getFieldValue(fieldName)
        };
        return result;
    };
    return MetaInput;
}(base_components_1.MetaContextFollower));
MetaInput.contextTypes = base_components_1.MetaContextFollower.contextTypes;
exports.MetaInput = MetaInput;
//# sourceMappingURL=meta-input.js.map