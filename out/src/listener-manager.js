"use strict";
var ListenerManager = (function () {
    function ListenerManager() {
        this._next = [];
        this._current = this._next;
    }
    ListenerManager.prototype.subscribe = function (listener) {
        var _this = this;
        this._ensureWritable();
        this._next.push(listener);
        var subscribed = true;
        return function () {
            if (!subscribed)
                return;
            subscribed = false;
            var pos = _this._next.indexOf(listener);
            if (-1 != pos) {
                _this._ensureWritable();
                _this._next.splice(pos, 1);
            }
        };
    };
    Object.defineProperty(ListenerManager.prototype, "all", {
        get: function () {
            this._current = this._next;
            return this._current;
        },
        enumerable: true,
        configurable: true
    });
    ListenerManager.prototype._ensureWritable = function () {
        if (this._current === this._next) {
            this._next = this._current.slice();
        }
    };
    return ListenerManager;
}());
exports.ListenerManager = ListenerManager;
function clickHandler(fun) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return function (event) {
        event.preventDefault();
        fun.apply(args[0], args.slice(1));
    };
}
exports.clickHandler = clickHandler;
//# sourceMappingURL=listener-manager.js.map