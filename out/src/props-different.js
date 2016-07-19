"use strict";
function propsDifferent(a, b) {
    return objectsDifferent(a, b);
}
exports.propsDifferent = propsDifferent;
function objectsDifferent(a, b) {
    if (a === b)
        return false;
    if ((null == a) != (null == b))
        return true;
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    if (arraysDifferent(keysA, keysB))
        return true;
    for (var _i = 0, keysA_1 = keysA; _i < keysA_1.length; _i++) {
        var k = keysA_1[_i];
        if (a[k] != b[k]) {
            if (Array.isArray(a[k])) {
                if (arraysDifferent(a[k], b[k])) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
    }
    return false;
}
function arraysDifferent(a, b) {
    if (a === b)
        return false;
    if ((null == a) != (null == b))
        return true;
    if (a.length !== b.length)
        return true;
    for (var i = 0, n = a.length; i < n; ++i) {
        if (a[i] != b[i])
            return true;
    }
    return false;
}
//# sourceMappingURL=props-different.js.map