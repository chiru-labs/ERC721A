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
exports.encodeBytes = void 0;
const Conversion = __importStar(require("../../conversion"));
const utf8_1 = __importDefault(require("utf8"));
//UGH -- it turns out TypeScript can't handle nested tagged unions
//see: https://github.com/microsoft/TypeScript/issues/18758
//so, I'm just going to have to throw in a bunch of type coercions >_>
/**
 * Encodes without padding, length, etc!
 *
 * @Category Encoding (low-level)
 */
function encodeBytes(input) {
    switch (input.type.typeClass) {
        case "bytes":
            return Conversion.toBytes(input.value.asHex);
        case "string": {
            let coercedInput = (input);
            switch (coercedInput.value.kind) {
                case "valid":
                    return stringToBytes(coercedInput.value.asString);
                case "malformed":
                    return Conversion.toBytes(coercedInput.value.asHex);
            }
        }
    }
}
exports.encodeBytes = encodeBytes;
/**
 * @Category Encoding (low-level)
 */
function stringToBytes(input) {
    input = utf8_1.default.encode(input);
    let bytes = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
        bytes[i] = input.charCodeAt(i);
    }
    return bytes;
    //NOTE: this will throw an error if the string contained malformed UTF-16!
    //but, well, it shouldn't contain that...
}
//# sourceMappingURL=index.js.map