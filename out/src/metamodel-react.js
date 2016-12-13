/* /// <reference path="../typings/index.d.ts" /> */
"use strict";
var metamodel_1 = require("@hn3000/metamodel");
exports.ValidationScope = metamodel_1.ValidationScope;
exports.ModelView = metamodel_1.ModelView;
exports.MessageSeverity = metamodel_1.MessageSeverity;
exports.ClientProps = metamodel_1.ClientProps;
var props_different_1 = require("./props-different");
exports.propsDifferent = props_different_1.propsDifferent;
var search_params_1 = require("./search-params");
exports.parseSearchParams = search_params_1.parseSearchParams;
var form_config_1 = require("./form-config");
exports.MetaFormConfig = form_config_1.MetaFormConfig;
var form_context_1 = require("./form-context");
exports.MetaFormContext = form_context_1.MetaFormContext;
var meta_form_1 = require("./meta-form");
exports.MetaForm = meta_form_1.MetaForm;
var meta_page_1 = require("./meta-page");
exports.MetaPage = meta_page_1.MetaPage;
var meta_input_1 = require("./meta-input");
exports.MetaInput = meta_input_1.MetaInput;
var base_components_1 = require("./base-components");
exports.MetaContextAware = base_components_1.MetaContextAware;
exports.MetaContextFollower = base_components_1.MetaContextFollower;
exports.MetaContextAwarePure = base_components_1.MetaContextAwarePure;
function chainUpdaters() {
    var updaters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        updaters[_i - 0] = arguments[_i];
    }
    return function (model, c) {
        return updaters.reduce(function (m, u) { return u(m, c); }, model);
    };
}
exports.chainUpdaters = chainUpdaters;
//# sourceMappingURL=metamodel-react.js.map