"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readStackLiteral = exports.readStack = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:stack:read");
const Evm = __importStar(require("../../evm"));
const errors_1 = require("../../errors");
function readStack(pointer, state) {
    let { from, to } = pointer;
    let { stack } = state;
    if (from < 0 || to >= stack.length) {
        throw new errors_1.DecodingError({
            kind: "ReadErrorStack",
            from,
            to
        });
    }
    //unforunately, Uint8Arrays don't support concat; if they did the rest of
    //this would be one line.  Or similarly if they worked with lodash's flatten,
    //but they don't support that either.  But neither of those are the case, so
    //we'll have to concatenate a bit more manually.
    let words = stack.slice(from, to + 1);
    let result = new Uint8Array(words.length * Evm.Utils.WORD_SIZE);
    //shouldn't we total up the lengths? yeah, but each one should have a
    //length of 32, so unless somehting's gone wrong we can just multiply
    for (let index = 0; index < words.length; index++) {
        result.set(words[index], index * Evm.Utils.WORD_SIZE);
    }
    return result;
}
exports.readStack = readStack;
function readStackLiteral(pointer) {
    return pointer.literal;
}
exports.readStackLiteral = readStackLiteral;
//# sourceMappingURL=index.js.map