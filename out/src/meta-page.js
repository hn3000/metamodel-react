"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var base_components_1 = require('./base-components');
var meta_form_1 = require('./meta-form');
var MetaPage = (function (_super) {
    __extends(MetaPage, _super);
    function MetaPage(props, context) {
        _super.call(this, props, context);
    }
    MetaPage.prototype.render = function () {
        var context = this.formContext;
        if (this.props.page == context.currentPage) {
            var formContext = this.formContext;
            var Wrapper = this.formContext.config.wrappers.page;
            return React.createElement(Wrapper, {busy: formContext.isBusy()}, this.props.children);
        }
        return null;
    };
    MetaPage.contextTypes = meta_form_1.MetaForm.childContextTypes;
    return MetaPage;
}(base_components_1.MetaContextFollower));
exports.MetaPage = MetaPage;
//# sourceMappingURL=meta-page.js.map