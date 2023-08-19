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
exports.message = void 0;
/**
 * @protected
 *
 * @packageDocumentation
 */
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:format:utils:exception");
const Format = __importStar(require("../common"));
const AstUtils = __importStar(require("../../ast/utils"));
//this function gives an error message
//for those errors that are meant to possibly
//be wrapped in a DecodingError and thrown
function message(error) {
    switch (error.kind) {
        case "UserDefinedTypeNotFoundError":
            let typeName = Format.Types.isContractDefinedType(error.type)
                ? error.type.definingContractName + "." + error.type.typeName
                : error.type.typeName;
            return `Unknown ${error.type.typeClass} type ${typeName} of id ${error.type.id}`;
        case "UnsupportedConstantError":
            return `Unsupported constant type ${AstUtils.typeClass(error.definition)}`;
        case "UnusedImmutableError":
            return "Cannot read unused immutable";
        case "ReadErrorStack":
            return `Can't read stack from position ${error.from} to ${error.to}`;
        case "ReadErrorBytes":
            return `Can't read ${error.length} bytes from ${error.location} starting at ${error.start}`;
        case "ReadErrorStorage":
            if (error.range.length) {
                return `Can't read ${error.range.length} bytes from storage starting at index ${error.range.from.index} in ${slotAddressPrintout(error.range.from.slot)}`;
            }
            else {
                return `Can't read storage from index ${error.range.from.index} in ${slotAddressPrintout(error.range.from.slot)} to index ${error.range.to.index} in ${slotAddressPrintout(error.range.to.slot)}`;
            }
    }
}
exports.message = message;
function slotAddressPrintout(slot) {
    if (slot.key !== undefined && slot.path !== undefined) {
        // mapping reference
        let { type: keyEncoding, value: keyValue } = keyInfoForPrinting(slot.key);
        return ("keccak(" +
            keyValue +
            " as " +
            keyEncoding +
            ", " +
            slotAddressPrintout(slot.path) +
            ") + " +
            slot.offset.toString());
    }
    else if (slot.path !== undefined) {
        const pathAddressPrintout = slotAddressPrintout(slot.path);
        return slot.hashPath
            ? "keccak(" + pathAddressPrintout + ")" + slot.offset.toString()
            : pathAddressPrintout + slot.offset.toString();
    }
    else {
        return slot.offset.toString();
    }
}
//this is like the old toSoliditySha3Input, but for debugging purposes ONLY
//it will NOT produce correct input to soliditySha3
//please use mappingKeyAsHex instead if you wish to encode a mapping key.
function keyInfoForPrinting(input) {
    switch (input.type.typeClass) {
        case "uint":
            return {
                type: "uint",
                value: input.value.asBN.toString()
            };
        case "int":
            return {
                type: "int",
                value: input.value.asBN.toString()
            };
        case "fixed":
            return {
                type: `fixed256x${input.type.places}`,
                value: input.value.asBig.toString()
            };
        case "ufixed":
            return {
                type: `ufixed256x${input.type.places}`,
                value: input.value.asBig.toString()
            };
        case "bool":
            //this is the case that won't work as valid input to soliditySha3 :)
            return {
                type: "uint",
                value: input.value.asBoolean.toString()
            };
        case "bytes":
            switch (input.type.kind) {
                case "static":
                    return {
                        type: "bytes32",
                        value: input.value.asHex
                    };
                case "dynamic":
                    return {
                        type: "bytes",
                        value: input.value.asHex
                    };
            }
        case "address":
            return {
                type: "address",
                value: input.value.asAddress
            };
        case "string":
            let coercedInput = (input);
            switch (coercedInput.value.kind) {
                case "valid":
                    return {
                        type: "string",
                        value: coercedInput.value.asString
                    };
                case "malformed":
                    return {
                        type: "bytes",
                        value: coercedInput.value.asHex
                    };
            }
        //fixed and ufixed are skipped for now
    }
}
//# sourceMappingURL=exception.js.map