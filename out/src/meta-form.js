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
var base_components_1 = require("./base-components");
var React = require("react");
var MetaForm = (function (_super) {
    __extends(MetaForm, _super);
    function MetaForm(props, context) {
        var _this = _super.call(this, props, context) || this;
        if (null == props.context) {
            console.log("no context found in context for MetaForm", props);
        }
        else {
            _this.initialContext(_this.props.context);
        }
        return _this;
    }
    MetaForm.prototype.getChildContext = function () {
        return {
            formContext: this.props.context
        };
    };
    MetaForm.prototype.render = function () {
        var formContext = this.formContext;
        var Wrapper = formContext.config.wrappers.form;
        /*
        let adjustedChildren = React.Children.map(this.props.children,
          (c) => React.cloneElement(c, {context: this.props.context}));
        */
        var metamodel = formContext.metamodel;
        var modelId = metamodel.propGet('schema').modelId || metamodel.name;
        return (React.createElement(Wrapper, { id: modelId, busy: formContext.isBusy() }, this.props.children));
    };
    MetaForm.prototype._extractState = function (context) {
        return {
            busy: context.isBusy(),
            page: context.currentPage,
            pageMessages: context.viewmodel.getStatusMessages(),
            statusMessages: context.viewmodel.getStatusMessages(),
            conclusio: context.getConclusion()
        };
    };
    return MetaForm;
}(base_components_1.MetaContextFollower));
MetaForm.childContextTypes = base_components_1.MetaContextAware.contextTypes;
exports.MetaForm = MetaForm;
//# sourceMappingURL=meta-form.js.map