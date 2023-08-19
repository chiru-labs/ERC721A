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
exports.byteLength = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:basic:allocate");
const Common = __importStar(require("../../common"));
const Evm = __importStar(require("../../evm"));
const Format = __importStar(require("../../format"));
//only for direct types!
function byteLength(dataType, userDefinedTypes) {
    switch (dataType.typeClass) {
        case "bool":
            return 1;
        case "address":
        case "contract":
            return Evm.Utils.ADDRESS_SIZE;
        case "int":
        case "uint":
        case "fixed":
        case "ufixed":
            return dataType.bits / 8;
        case "function":
            switch (dataType.visibility) {
                case "internal":
                    return Evm.Utils.PC_SIZE * 2;
                case "external":
                    return Evm.Utils.ADDRESS_SIZE + Evm.Utils.SELECTOR_SIZE;
            }
        case "bytes": //we assume we're in the static case
            return dataType.length;
        case "enum": {
            const storedType = userDefinedTypes[dataType.id];
            if (!storedType || !storedType.options) {
                throw new Common.UnknownUserDefinedTypeError(dataType.id, Format.Types.typeString(dataType));
            }
            const numValues = storedType.options.length;
            return Math.ceil(Math.log2(numValues) / 8);
        }
        case "userDefinedValueType": {
            const storedType = userDefinedTypes[dataType.id];
            if (!storedType || !storedType.underlyingType) {
                throw new Common.UnknownUserDefinedTypeError(dataType.id, Format.Types.typeString(dataType));
            }
            const { underlyingType } = storedType;
            return byteLength(underlyingType, userDefinedTypes);
        }
    }
}
exports.byteLength = byteLength;
//# sourceMappingURL=index.js.map