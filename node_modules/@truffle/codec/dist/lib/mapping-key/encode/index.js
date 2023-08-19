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
exports.mappingKeyAsHex = exports.encodeMappingKey = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:mapping-key:encode");
const Conversion = __importStar(require("../../conversion"));
const BasicEncode = __importStar(require("../../basic/encode"));
const BytesEncode = __importStar(require("../../bytes/encode"));
//UGH -- it turns out TypeScript can't handle nested tagged unions
//see: https://github.com/microsoft/TypeScript/issues/18758
//so, I'm just going to have to throw in a bunch of type coercions >_>
/**
 * @Category Encoding (low-level)
 */
function encodeMappingKey(input) {
    if (input.type.typeClass === "string" ||
        (input.type.typeClass === "bytes" && input.type.kind === "dynamic")) {
        return BytesEncode.encodeBytes(input);
    }
    else {
        return BasicEncode.encodeBasic(input);
    }
}
exports.encodeMappingKey = encodeMappingKey;
/**
 * @Category Encoding (low-level)
 */
function mappingKeyAsHex(input) {
    return Conversion.toHexString(encodeMappingKey(input));
}
exports.mappingKeyAsHex = mappingKeyAsHex;
//# sourceMappingURL=index.js.map