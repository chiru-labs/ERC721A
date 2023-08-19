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
exports.isSkippedInMemoryStructs = exports.getMemoryAllocations = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:memory:allocate");
const Evm = __importStar(require("../../evm"));
function getMemoryAllocations(userDefinedTypes) {
    let allocations = {};
    for (const dataType of Object.values(userDefinedTypes)) {
        if (dataType.typeClass === "struct") {
            allocations[dataType.id] = allocateStruct(dataType);
        }
    }
    return allocations;
}
exports.getMemoryAllocations = getMemoryAllocations;
function isSkippedInMemoryStructs(dataType) {
    if (dataType.typeClass === "mapping") {
        return true;
    }
    else if (dataType.typeClass === "array") {
        return isSkippedInMemoryStructs(dataType.baseType);
    }
    else {
        return false;
    }
}
exports.isSkippedInMemoryStructs = isSkippedInMemoryStructs;
//unlike in storage and calldata, we'll just return the one allocation, nothing fancy
//that's because allocating one struct can never necessitate allocating another
function allocateStruct(dataType) {
    let memberAllocations = [];
    let position = 0;
    for (const { name, type: memberType } of dataType.memberTypes) {
        const length = isSkippedInMemoryStructs(memberType)
            ? 0
            : Evm.Utils.WORD_SIZE;
        memberAllocations.push({
            name,
            type: memberType,
            pointer: {
                location: "memory",
                start: position,
                length
            }
        });
        position += length;
    }
    return {
        members: memberAllocations
    };
}
//# sourceMappingURL=index.js.map