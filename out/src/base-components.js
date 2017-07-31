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
var React = require("react");
var PropTypes = require("prop-types");
var props_different_1 = require("./props-different");
exports.MetaForm_ContextTypes = {
    isRequired: function () { return false; },
    formContext: PropTypes.shape({
        config: PropTypes.object,
        metamodel: PropTypes.object,
        viewmodel: PropTypes.object,
        currentPage: PropTypes.number,
        i18nData: PropTypes.object
    })
};
var MetaContextAware = (function (_super) {
    __extends(MetaContextAware, _super);
    function MetaContextAware(props, context) {
        var _this = _super.call(this, props, context) || this;
        if (null == _this.formContext || null == _this.formContext.metamodel) {
            var name_1 = _this.constructor.name || '';
            console.log("missing context info in MetaContextAware " + name_1, props, context);
        }
        return _this;
    }
    Object.defineProperty(MetaContextAware.prototype, "formContext", {
        get: function () {
            return this.props.context || this.context.formContext;
        },
        enumerable: true,
        configurable: true
    });
    MetaContextAware.contextTypes = exports.MetaForm_ContextTypes;
    return MetaContextAware;
}(React.Component));
exports.MetaContextAware = MetaContextAware;
var MetaContextAwarePure = (function (_super) {
    __extends(MetaContextAwarePure, _super);
    function MetaContextAwarePure() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MetaContextAwarePure.prototype.shouldComponentUpdate = function (nextProps, nextState, nextContext) {
        return props_different_1.propsDifferent(this.props, nextProps);
    };
    return MetaContextAwarePure;
}(MetaContextAware));
exports.MetaContextAwarePure = MetaContextAwarePure;
var MetaContextFollower = (function (_super) {
    __extends(MetaContextFollower, _super);
    function MetaContextFollower(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this._unsubscribe = null;
        return _this;
    }
    MetaContextFollower.prototype.initialContext = function (context) {
        this._updatedContext(context, true);
    };
    MetaContextFollower.prototype._extractState = function (context) {
        var newState = {
            currentPage: context.currentPage,
            viewmodel: context.viewmodel
        };
        return newState;
    };
    MetaContextFollower.prototype._updatedContext = function (context, initState) {
        var newState = this._extractState(context);
        if (initState) {
            this.state = newState;
        }
        else {
            if (props_different_1.propsDifferent(this.state, newState)) {
                this.setState(newState);
            }
        }
    };
    MetaContextFollower.prototype.componentDidMount = function () {
        var _this = this;
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = this.formContext.subscribe(function () {
            if (!_this._unsubscribe)
                return;
            _this._updatedContext(_this.formContext);
            //this.forceUpdate();
        });
    };
    MetaContextFollower.prototype.componentWillUnmount = function () {
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = null;
    };
    MetaContextFollower.contextTypes = exports.MetaForm_ContextTypes;
    return MetaContextFollower;
}(MetaContextAware));
exports.MetaContextFollower = MetaContextFollower;
//# sourceMappingURL=base-components.js.map