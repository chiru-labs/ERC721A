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
exports.decodeMagic = exports.decodeSpecial = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:special:decode");
const Basic = __importStar(require("../../basic"));
const Bytes = __importStar(require("../../bytes"));
const Compiler = __importStar(require("../../compiler"));
const Evm = __importStar(require("../../evm"));
function* decodeSpecial(dataType, pointer, info) {
    if (dataType.typeClass === "magic") {
        return yield* decodeMagic(dataType, pointer, info);
    }
    else {
        return yield* Basic.Decode.decodeBasic(dataType, pointer, info);
    }
}
exports.decodeSpecial = decodeSpecial;
function* decodeMagic(dataType, pointer, info) {
    let { state } = info;
    switch (pointer.special) {
        case "msg":
            return {
                type: dataType,
                kind: "value",
                value: {
                    data: yield* Bytes.Decode.decodeBytes({
                        typeClass: "bytes",
                        kind: "dynamic",
                        location: "calldata"
                    }, {
                        location: "calldata",
                        start: 0,
                        length: state.calldata.length
                    }, info),
                    sig: yield* Basic.Decode.decodeBasic({
                        typeClass: "bytes",
                        kind: "static",
                        length: Evm.Utils.SELECTOR_SIZE
                    }, {
                        location: "calldata",
                        start: 0,
                        length: Evm.Utils.SELECTOR_SIZE
                    }, info),
                    sender: yield* Basic.Decode.decodeBasic(senderType(info.currentContext.compiler), { location: "special", special: "sender" }, info),
                    value: yield* Basic.Decode.decodeBasic({
                        typeClass: "uint",
                        bits: 256
                    }, { location: "special", special: "value" }, info)
                }
            };
        case "tx":
            return {
                type: dataType,
                kind: "value",
                value: {
                    origin: yield* Basic.Decode.decodeBasic(senderType(info.currentContext.compiler), { location: "special", special: "origin" }, info),
                    gasprice: yield* Basic.Decode.decodeBasic({
                        typeClass: "uint",
                        bits: 256
                    }, { location: "special", special: "gasprice" }, info)
                }
            };
        case "block":
            let block = {
                coinbase: yield* Basic.Decode.decodeBasic(coinbaseType(info.currentContext.compiler), { location: "special", special: "coinbase" }, info)
            };
            //the other ones are all uint's, so let's handle them all at once; due to
            //the lack of generator arrow functions, we do it by mutating block
            const variables = ["difficulty", "gaslimit", "number", "timestamp"];
            if (solidityVersionHasChainId(info.currentContext.compiler)) {
                variables.push("chainid");
            }
            if (solidityVersionHasBaseFee(info.currentContext.compiler)) {
                variables.push("basefee");
            }
            for (let variable of variables) {
                block[variable] = yield* Basic.Decode.decodeBasic({
                    typeClass: "uint",
                    bits: 256
                }, { location: "special", special: variable }, info);
            }
            return {
                type: dataType,
                kind: "value",
                value: block
            };
    }
}
exports.decodeMagic = decodeMagic;
function senderType(compiler) {
    switch (Compiler.Utils.solidityFamily(compiler)) {
        case "unknown":
        case "pre-0.5.0":
            return {
                typeClass: "address",
                kind: "general"
            };
        case "0.5.x":
            return {
                typeClass: "address",
                kind: "specific",
                payable: true
            };
        default:
            return {
                typeClass: "address",
                kind: "specific",
                payable: false
            };
    }
}
function coinbaseType(compiler) {
    switch (Compiler.Utils.solidityFamily(compiler)) {
        case "unknown":
        case "pre-0.5.0":
            return {
                typeClass: "address",
                kind: "general"
            };
        case "0.5.x":
        case "0.8.x":
        case "0.8.7+":
        case "0.8.9+":
            return {
                typeClass: "address",
                kind: "specific",
                payable: true
            };
    }
}
function solidityVersionHasChainId(compiler) {
    switch (Compiler.Utils.solidityFamily(compiler)) {
        case "unknown":
        case "pre-0.5.0":
        case "0.5.x":
            return false;
        default:
            return true;
    }
}
function solidityVersionHasBaseFee(compiler) {
    switch (Compiler.Utils.solidityFamily(compiler)) {
        case "unknown":
        case "pre-0.5.0":
        case "0.5.x":
        case "0.8.x":
            return false;
        default:
            return true;
    }
}
//# sourceMappingURL=index.js.map