"use strict";
function propsDifferent(a, b) {
    if (Array.isArray(a)) {
        if (arraysDifferent(a, b)) {
            return true;
        }
    }
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
            var thisA = a[k];
            var thisB = b[k];
            if (Array.isArray(thisA)) {
                if (arraysDifferent(thisA, thisB)) {
                    return true;
                }
            }
            else if (null != thisA && typeof thisA === 'object') {
                if (objectsDifferent(thisA, thisB)) {
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
exports.objectsDifferent = objectsDifferent;
function arraysDifferent(a, b) {
    if (a === b)
        return false;
    if ((null == a) != (null == b))
        return true;
    if (a.length !== b.length)
        return true;
    for (var i = 0, n = a.length; i < n; ++i) {
        if (objectsDifferent(a[i], b[i])) {
            return true;
        }
    }
    return false;
}
exports.arraysDifferent = arraysDifferent;
//# sourceMappingURL=props-different.js.map