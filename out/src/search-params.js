"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rqpre = /[?&]([^=&]*)(?:=([^&]*))?/g;
function parseSearchParams(search) {
    var result = {};
    if (search && search != '') {
        var match;
        while (match = rqpre.exec(search)) {
            var name = match[1];
            var value = decodeURIComponent(match[2]);
            if (!result[name]) {
                result[name] = [value];
            }
            else {
                var v = result[name];
                v.push(value);
            }
        }
    }
    return result;
}
exports.parseSearchParams = parseSearchParams;
//# sourceMappingURL=search-params.js.map