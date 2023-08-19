"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSpecial = void 0;
function readSpecial(pointer, state) {
    //not bothering with error handling on this one as I don't expect errors
    return state.specials[pointer.special];
}
exports.readSpecial = readSpecial;
//# sourceMappingURL=index.js.map