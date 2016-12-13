"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var props_different_1 = require("./props-different");
exports.MetaForm_ContextTypes = {
    formContext: React.PropTypes.shape({
        config: React.PropTypes.object,
        metamodel: React.PropTypes.object,
        viewmodel: React.PropTypes.object,
        currentPage: React.PropTypes.number,
        i18nData: React.PropTypes.object
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
    return MetaContextAware;
}(React.Component));
MetaContextAware.contextTypes = exports.MetaForm_ContextTypes;
exports.MetaContextAware = MetaContextAware;
var MetaContextAwarePure = (function (_super) {
    __extends(MetaContextAwarePure, _super);
    function MetaContextAwarePure() {
        return _super.apply(this, arguments) || this;
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
    MetaContextFollower.prototype._updatedState = function (context, initState) {
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
    MetaContextFollower.prototype.componentDidMount = function () {
        var _this = this;
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = this.formContext.subscribe(function () {
            if (!_this._unsubscribe)
                return;
            _this._updatedState(_this.formContext);
            _this.forceUpdate();
        });
    };
    MetaContextFollower.prototype.componentWillUnmount = function () {
        this._unsubscribe && this._unsubscribe();
        this._unsubscribe = null;
    };
    return MetaContextFollower;
}(MetaContextAware));
MetaContextFollower.contextTypes = exports.MetaForm_ContextTypes;
exports.MetaContextFollower = MetaContextFollower;
//# sourceMappingURL=base-components.js.map