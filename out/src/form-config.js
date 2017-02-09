"use strict";
var fields = require("./default-field-types");
function objMatcher(template) {
    var keys = Object.keys(template);
    var n = keys.length;
    return (function (field /*</any>*/) {
        var result = 0;
        var fieldObj = field;
        var schema = fieldObj && fieldObj.propGet && fieldObj.propGet('schema');
        for (var i = 0; i < n; i++) {
            var k = keys[i];
            var t = template[k];
            if (t == fieldObj[k] || t == schema[k]) {
                ++result;
            }
            else {
                return 0;
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
        matcher[_i] = arguments[_i];
    }
    return function (field) { return matcher.reduce(function (q, m) {
        var qq = m(field);
        return qq && q + qq;
    }, 0); };
}
function hasPossibleValueCountBetween(from, to) {
    return function (field) {
        var possibleValues = field.asItemType() && field.asItemType().possibleValues();
        var pvc = possibleValues ? possibleValues.length : 0;
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
        this.validateOnUpdateIfInvalid = false;
        this.validateDebounceMS = 1000; //in ms
        this.busyDelayMS = 200;
        this.allowNavigationWithInvalidPages = false;
        this.onFormInit = null; // </any>
        this.onPageTransition = null; // </IValidationMessage>
        this.onAfterPageTransition = null;
        this.onFailedPageTransition = null;
        this.onModelUpdate = null;
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
                matchQuality: objMatcher({ kind: 'object', format: 'file' }),
                component: fields.MetaFormInputFile
            },
            {
                matchQuality: andMatcher(kindMatcher('string'), hasPossibleValueCountBetween(10, undefined)),
                component: fields.MetaFormInputEnumSelect
            },
            {
                matchQuality: andMatcher(kindMatcher('string'), hasPossibleValueCountBetween(2, 10)),
                component: fields.MetaFormInputEnumRadios
            },
            {
                matchQuality: andMatcher(kindMatcher('string'), hasPossibleValueCountBetween(1, 2)),
                component: fields.MetaFormInputEnumCheckbox
            }
        ];
    };
    return MetaFormConfig;
}());
exports.MetaFormConfig = MetaFormConfig;
//# sourceMappingURL=form-config.js.map