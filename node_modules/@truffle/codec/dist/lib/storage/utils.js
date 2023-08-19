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
exports.equalSlots = exports.slotAddress = exports.storageLengthToBytes = exports.isWordsLength = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:storage:utils");
const Evm = __importStar(require("../evm"));
const MappingKey = __importStar(require("../mapping-key"));
function isWordsLength(size) {
    return size.words !== undefined;
}
exports.isWordsLength = isWordsLength;
function storageLengthToBytes(size) {
    if (isWordsLength(size)) {
        debug("size.words %d", size.words);
        return size.words * Evm.Utils.WORD_SIZE;
    }
    else {
        return size.bytes;
    }
}
exports.storageLengthToBytes = storageLengthToBytes;
/**
 * convert a slot to a word corresponding to actual storage address
 *
 * if `slot` is an array, return hash of array values.
 * if `slot` array is nested, recurse on sub-arrays
 *
 * @param slot - number or possibly-nested array of numbers
 */
function slotAddress(slot) {
    if (slot.key !== undefined && slot.path !== undefined) {
        // mapping reference
        return Evm.Utils.keccak256(MappingKey.Encode.mappingKeyAsHex(slot.key), slotAddress(slot.path)).add(slot.offset);
    }
    else if (slot.path !== undefined) {
        const pathAddress = slotAddress(slot.path);
        const path = slot.hashPath
            ? Evm.Utils.keccak256(pathAddress)
            : pathAddress;
        return path.add(slot.offset);
    }
    else {
        return slot.offset;
    }
}
exports.slotAddress = slotAddress;
//note: this function compares slots mostly by structure,
//rather than by their numerical value
function equalSlots(slot1, slot2) {
    if (!slot1 || !slot2) {
        return !slot1 && !slot2; //if either is undefined, it's true only if both are
    }
    if (!slot1.offset.eq(slot2.offset)) {
        return false;
    }
    if (slot1.hashPath !== slot2.hashPath) {
        return false;
    }
    if (!equalSlots(slot1.path, slot2.path)) {
        return false;
    }
    //to compare keys, we'll just compare their hex encodings
    //(yes, that leaves some wiggle room, as it could consider different
    //*types* of keys to be equal, but if keys are the only difference then
    //that should determine those types, so it shouldn't be a problem)
    if (!slot1.key || !slot2.key) {
        //first, though, they likely don't *have* keys
        return !slot1.key && !slot2.key;
    }
    //if they do have keys, though...
    return Evm.Utils.equalData(MappingKey.Encode.encodeMappingKey(slot1.key), MappingKey.Encode.encodeMappingKey(slot2.key));
}
exports.equalSlots = equalSlots;
//# sourceMappingURL=utils.js.map