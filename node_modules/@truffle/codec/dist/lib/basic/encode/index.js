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
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBasic = void 0;
const Conversion = __importStar(require("../../conversion"));
const Evm = __importStar(require("../../evm"));
//UGH -- it turns out TypeScript can't handle nested tagged unions
//see: https://github.com/microsoft/TypeScript/issues/18758
//so, I'm just going to have to throw in a bunch of type coercions >_>
/**
 * Handles encoding of basic types; yes the input type is broader than
 * it should be but it's hard to fix this without causing other problems,
 * sorry!
 * @Category Encoding (low-level)
 */
function encodeBasic(input) {
    let bytes;
    switch (input.type.typeClass) {
        case "userDefinedValueType":
            return encodeBasic(input.value);
        case "uint":
        case "int":
            return Conversion.toBytes(input.value.asBN, Evm.Utils.WORD_SIZE);
        case "enum":
            return Conversion.toBytes(input.value.numericAsBN, Evm.Utils.WORD_SIZE);
        case "bool": {
            bytes = new Uint8Array(Evm.Utils.WORD_SIZE); //is initialized to zeroes
            if (input.value.asBoolean) {
                bytes[Evm.Utils.WORD_SIZE - 1] = 1;
            }
            return bytes;
        }
        case "bytes":
            switch (input.type.kind) {
                //deliberately not handling dynamic case!
                case "static":
                    bytes = Conversion.toBytes(input.value.asHex);
                    let padded = new Uint8Array(Evm.Utils.WORD_SIZE); //initialized to zeroes
                    padded.set(bytes);
                    return padded;
            }
        case "address":
            return Conversion.toBytes(input.value.asAddress, Evm.Utils.WORD_SIZE);
        case "contract":
            return Conversion.toBytes(input.value.address, Evm.Utils.WORD_SIZE);
        case "function": {
            switch (input.type.visibility) {
                //for our purposes here, we will NOT count internal functions as a
                //basic type!  so no handling of internal case
                case "external":
                    let coercedInput = input;
                    let encoded = new Uint8Array(Evm.Utils.WORD_SIZE); //starts filled w/0s
                    let addressBytes = Conversion.toBytes(coercedInput.value.contract.address); //should already be correct length
                    let selectorBytes = Conversion.toBytes(coercedInput.value.selector); //should already be correct length
                    encoded.set(addressBytes);
                    encoded.set(selectorBytes, Evm.Utils.ADDRESS_SIZE); //set it after the address
                    return encoded;
            }
            break; //to satisfy TS
        }
        case "fixed":
        case "ufixed":
            let bigValue = (input).value.asBig;
            let shiftedValue = Conversion.shiftBigUp(bigValue, input.type.places);
            return Conversion.toBytes(shiftedValue, Evm.Utils.WORD_SIZE);
    }
}
exports.encodeBasic = encodeBasic;
//# sourceMappingURL=index.js.map