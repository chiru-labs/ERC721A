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
exports.encodeTopic = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:topic:encode");
const Conversion = __importStar(require("../../conversion"));
const Evm = __importStar(require("../../evm"));
const BasicEncode = __importStar(require("../../basic/encode"));
/**
 * Encodes for event topics (indexed parameters).
 * Warning: This function is not fully implemented yet!
 * @Category Encoding (low-level)
 */
function encodeTopic(input) {
    //errors can't be encoded
    if (input.kind === "error") {
        debug("input: %O", input);
        //...unless it's an IndexedReferenceTypeError, in which
        //case, let's read otu that raw data!
        if (input.error.kind === "IndexedReferenceTypeError") {
            return Conversion.toBytes(input.error.raw, Evm.Utils.WORD_SIZE);
        }
        else {
            return undefined;
        }
    }
    //otherwise, just dispath to encodeBasic
    return BasicEncode.encodeBasic(input);
    //...of course, really here we should be checking
    //whether the input *is* a basic type, and if not, handling
    //that appropriately!  But so far we don't need this, so this
    //part of the function isn't implemented yet
}
exports.encodeTopic = encodeTopic;
//# sourceMappingURL=index.js.map