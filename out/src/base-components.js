"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var props_different_1 = require('./props-different');
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
        _super.call(this, props, context);
        if (null == this.formContext || null == this.formContext.metamodel) {
            var name_1 = this.constructor.name || '';
            console.log("missing context info in MetaContextAware " + name_1, props, context);
        }
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
        _super.apply(this, arguments);
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
        _super.call(this, props, context);
        this._unsubscribe = null;
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
    MetaContextFollower.contextTypes = exports.MetaForm_ContextTypes;
    return MetaContextFollower;
}(MetaContextAware));
exports.MetaContextFollower = MetaContextFollower;
//# sourceMappingURL=base-components.js.map