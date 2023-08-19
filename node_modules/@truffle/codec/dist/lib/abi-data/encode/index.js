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
exports.encodeTupleAbi = exports.encodeAbi = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:abi-data:encode");
const Conversion = __importStar(require("../../conversion"));
const Basic = __importStar(require("../../basic"));
const Bytes = __importStar(require("../../bytes"));
const Evm = __importStar(require("../../evm"));
const allocate_1 = require("../allocate");
const lodash_sum_1 = __importDefault(require("lodash.sum"));
//UGH -- it turns out TypeScript can't handle nested tagged unions
//see: https://github.com/microsoft/TypeScript/issues/18758
//so, I'm just going to have to throw in a bunch of type coercions >_>
/**
 * @Category Encoding (low-level)
 */
function encodeAbi(input, allocations) {
    //errors can't be encoded
    if (input.kind === "error") {
        return undefined;
    }
    let bytes;
    //TypeScript can at least infer in the rest of this that we're looking
    //at a value, not an error!  But that's hardly enough...
    switch (input.type.typeClass) {
        case "mapping":
        case "magic":
        case "type":
            //none of these can go in the ABI
            return undefined;
        case "bytes":
            switch (input.type.kind) {
                case "static":
                    return Basic.Encode.encodeBasic(input);
                case "dynamic":
                    bytes = Bytes.Encode.encodeBytes((input));
                    return padAndPrependLength(bytes);
            }
        case "string":
            bytes = Bytes.Encode.encodeBytes(input);
            return padAndPrependLength(bytes);
        case "function": {
            switch (input.type.visibility) {
                case "internal":
                    return undefined; //internal functions can't go in the ABI!
                //Yes, technically we could defer to encodeBasic here, but,
                //c'mon, that's not how the function's supposed to be used
                case "external":
                    return Basic.Encode.encodeBasic(input);
            }
        }
        //now for the serious cases
        case "array": {
            let coercedInput = (input);
            if (coercedInput.reference !== undefined) {
                return undefined; //circular values can't be encoded
            }
            let staticEncoding = encodeTupleAbi(coercedInput.value, allocations);
            switch (input.type.kind) {
                case "static":
                    return staticEncoding;
                case "dynamic":
                    let encoded = new Uint8Array(Evm.Utils.WORD_SIZE + staticEncoding.length); //leave room for length
                    encoded.set(staticEncoding, Evm.Utils.WORD_SIZE); //again, leave room for length beforehand
                    let lengthBytes = Conversion.toBytes(coercedInput.value.length, Evm.Utils.WORD_SIZE);
                    encoded.set(lengthBytes); //and now we set the length
                    return encoded;
            }
        }
        case "struct": {
            let coercedInput = (input);
            if (coercedInput.reference !== undefined) {
                return undefined; //circular values can't be encoded
            }
            return encodeTupleAbi(coercedInput.value.map(({ value }) => value), allocations);
        }
        case "tuple":
            //WARNING: This case is written in a way that involves a bunch of unnecessary recomputation!
            //(That may not be apparent from this one line, but it's true)
            //I'm writing it this way anyway for simplicity, to avoid rewriting the encoder
            //However it may be worth revisiting this in the future if performance turns out to be a problem
            return encodeTupleAbi(input.value.map(({ value }) => value), allocations);
        default:
            return Basic.Encode.encodeBasic(input);
    }
}
exports.encodeAbi = encodeAbi;
/**
 * @Category Encoding (low-level)
 */
function padAndPrependLength(bytes) {
    let length = bytes.length;
    let paddedLength = Evm.Utils.WORD_SIZE * Math.ceil(length / Evm.Utils.WORD_SIZE);
    let encoded = new Uint8Array(Evm.Utils.WORD_SIZE + paddedLength);
    encoded.set(bytes, Evm.Utils.WORD_SIZE); //start 32 in to leave room for the length beforehand
    let lengthBytes = Conversion.toBytes(length, Evm.Utils.WORD_SIZE);
    encoded.set(lengthBytes); //and now we set the length
    return encoded;
}
/**
 * @Category Encoding (low-level)
 */
function encodeTupleAbi(tuple, allocations) {
    let elementEncodings = tuple.map(element => encodeAbi(element, allocations));
    if (elementEncodings.some(element => element === undefined)) {
        return undefined;
    }
    let elementSizeInfo = tuple.map(element => allocate_1.abiSizeInfo(element.type, allocations));
    //heads and tails here are as discussed in the ABI docs;
    //for a static type the head is the encoding and the tail is empty,
    //for a dynamic type the head is the pointer and the tail is the encoding
    let heads = [];
    let tails = [];
    //but first, we need to figure out where the first tail will start,
    //by adding up the sizes of all the heads (we can easily do this in
    //advance via elementSizeInfo, without needing to know the particular
    //values of the heads)
    let startOfNextTail = lodash_sum_1.default(elementSizeInfo.map(elementInfo => elementInfo.size));
    for (let i = 0; i < tuple.length; i++) {
        let head;
        let tail;
        if (!elementSizeInfo[i].dynamic) {
            //static case
            head = elementEncodings[i];
            tail = new Uint8Array(); //empty array
        }
        else {
            //dynamic case
            head = Conversion.toBytes(startOfNextTail, Evm.Utils.WORD_SIZE);
            tail = elementEncodings[i];
        }
        heads.push(head);
        tails.push(tail);
        startOfNextTail += tail.length;
    }
    //finally, we need to concatenate everything together!
    //since we're dealing with Uint8Arrays, we have to do this manually
    let totalSize = startOfNextTail;
    let encoded = new Uint8Array(totalSize);
    let position = 0;
    for (let head of heads) {
        encoded.set(head, position);
        position += head.length;
    }
    for (let tail of tails) {
        encoded.set(tail, position);
        position += tail.length;
    }
    return encoded;
}
exports.encodeTupleAbi = encodeTupleAbi;
//# sourceMappingURL=index.js.map