"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberToHex = void 0;
var ethereumjs_util_1 = require("ethereumjs-util");
/**
 * Returns a 0x-prefixed hex number string from a hex string or string integer.
 * @param {string} input string to check, convert, and return
 */
var numberToHex = function (input) {
    if (!input)
        return undefined;
    if (!(0, ethereumjs_util_1.isHexString)(input)) {
        var regex = new RegExp(/^\d+$/); // test to make sure input contains only digits
        if (!regex.test(input)) {
            var msg = "Cannot convert string to hex string. numberToHex only supports 0x-prefixed hex or integer strings but the given string was: " + input;
            throw new Error(msg);
        }
        return '0x' + parseInt(input, 10).toString(16);
    }
    return input;
};
exports.numberToHex = numberToHex;
//# sourceMappingURL=helpers.js.map