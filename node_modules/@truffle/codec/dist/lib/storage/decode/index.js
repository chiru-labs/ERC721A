"use strict";
/**
 * @protected
 *
 * @packageDocumentation
 */
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
exports.decodeStorageReference = exports.decodeStorageReferenceByAddress = exports.decodeStorage = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:storage:decode");
const read_1 = __importDefault(require("../../read"));
const Conversion = __importStar(require("../../conversion"));
const Format = __importStar(require("../../format"));
const Basic = __importStar(require("../../basic"));
const Bytes = __importStar(require("../../bytes"));
const Utils = __importStar(require("../utils"));
const Evm = __importStar(require("../../evm"));
const allocate_1 = require("../allocate");
const bn_js_1 = __importDefault(require("bn.js"));
const errors_1 = require("../../errors");
function* decodeStorage(dataType, pointer, info) {
    if (Format.Types.isReferenceType(dataType)) {
        return yield* decodeStorageReference(dataType, pointer, info);
    }
    else {
        return yield* Basic.Decode.decodeBasic(dataType, pointer, info);
    }
}
exports.decodeStorage = decodeStorage;
//decodes storage at the address *read* from the pointer -- hence why this takes DataPointer rather than StoragePointer.
//NOTE: ONLY for use with pointers to reference types!
//Of course, pointers to value types don't exist in Solidity, so that warning is redundant, but...
function* decodeStorageReferenceByAddress(dataType, pointer, info) {
    const allocations = info.allocations.storage;
    let rawValue;
    try {
        rawValue = yield* read_1.default(pointer, info.state);
    }
    catch (error) {
        return errors_1.handleDecodingError(dataType, error);
    }
    const startOffset = Conversion.toBN(rawValue);
    let rawSize;
    try {
        rawSize = allocate_1.storageSize(dataType, info.userDefinedTypes, allocations, info.currentContext.compiler);
    }
    catch (error) {
        return errors_1.handleDecodingError(dataType, error);
    }
    //we *know* the type being decoded must be sized in words, because it's a
    //reference type, but TypeScript doesn't, so we'll have to use a type
    //coercion
    const size = rawSize.words;
    //now, construct the storage pointer
    const newPointer = {
        location: "storage",
        range: {
            from: {
                slot: {
                    offset: startOffset
                },
                index: 0
            },
            to: {
                slot: {
                    offset: startOffset.addn(size - 1)
                },
                index: Evm.Utils.WORD_SIZE - 1
            }
        }
    };
    //dispatch to decodeStorageReference
    return yield* decodeStorageReference(dataType, newPointer, info);
}
exports.decodeStorageReferenceByAddress = decodeStorageReferenceByAddress;
function* decodeStorageReference(dataType, pointer, info) {
    var data;
    var length;
    const { state } = info;
    const allocations = info.allocations.storage;
    switch (dataType.typeClass) {
        case "array": {
            debug("storage array! %o", pointer);
            let lengthAsBN;
            switch (dataType.kind) {
                case "dynamic":
                    debug("dynamic array");
                    debug("type %O", dataType);
                    try {
                        data = yield* read_1.default(pointer, state);
                    }
                    catch (error) {
                        return errors_1.handleDecodingError(dataType, error);
                    }
                    lengthAsBN = Conversion.toBN(data);
                    break;
                case "static":
                    debug("static array");
                    lengthAsBN = dataType.length;
                    break;
            }
            try {
                length = lengthAsBN.toNumber();
            }
            catch (_a) {
                return {
                    type: dataType,
                    kind: "error",
                    error: {
                        kind: "OverlongArraysAndStringsNotImplementedError",
                        lengthAsBN
                    }
                };
            }
            debug("length %o", length);
            debug("about to determine baseSize");
            let baseSize;
            try {
                baseSize = allocate_1.storageSize(dataType.baseType, info.userDefinedTypes, allocations, info.currentContext.compiler);
            }
            catch (error) {
                return errors_1.handleDecodingError(dataType, error);
            }
            debug("baseSize %o", baseSize);
            //we are going to make a list of child ranges, pushing them one by one onto
            //this list, and then decode them; the first part will vary based on whether
            //we're in the words case or the bytes case, the second will not
            let ranges = [];
            if (Utils.isWordsLength(baseSize)) {
                //currentSlot will point to the start of the entry being decoded
                let currentSlot = {
                    path: pointer.range.from.slot,
                    offset: new bn_js_1.default(0),
                    hashPath: dataType.kind === "dynamic"
                };
                for (let i = 0; i < length; i++) {
                    let childRange = {
                        from: {
                            slot: {
                                path: currentSlot.path,
                                offset: currentSlot.offset.clone(),
                                hashPath: currentSlot.hashPath
                            },
                            index: 0
                        },
                        to: {
                            slot: {
                                path: currentSlot.path,
                                offset: currentSlot.offset.addn(baseSize.words - 1),
                                hashPath: currentSlot.hashPath
                            },
                            index: Evm.Utils.WORD_SIZE - 1
                        }
                    };
                    ranges.push(childRange);
                    currentSlot.offset.iaddn(baseSize.words);
                }
            }
            else {
                const perWord = Math.floor(Evm.Utils.WORD_SIZE / baseSize.bytes);
                debug("perWord %d", perWord);
                //currentPosition will point to the start of the entry being decoded
                //note we have baseSize.bytes <= Evm.Utils.WORD_SIZE
                let currentPosition = {
                    slot: {
                        path: pointer.range.from.slot,
                        offset: new bn_js_1.default(0),
                        hashPath: dataType.kind === "dynamic"
                    },
                    index: Evm.Utils.WORD_SIZE - baseSize.bytes //note the starting index!
                };
                for (let i = 0; i < length; i++) {
                    let childRange = {
                        from: {
                            slot: {
                                path: currentPosition.slot.path,
                                offset: currentPosition.slot.offset.clone(),
                                hashPath: currentPosition.slot.hashPath
                            },
                            index: currentPosition.index
                        },
                        length: baseSize.bytes
                    };
                    ranges.push(childRange);
                    currentPosition.index -= baseSize.bytes;
                    if (currentPosition.index < 0) {
                        currentPosition.slot.offset.iaddn(1);
                        currentPosition.index = Evm.Utils.WORD_SIZE - baseSize.bytes;
                    }
                }
            }
            let decodedChildren = [];
            for (let childRange of ranges) {
                decodedChildren.push(yield* decodeStorage(dataType.baseType, { location: "storage", range: childRange }, info));
            }
            return {
                type: dataType,
                kind: "value",
                value: decodedChildren
            };
        }
        case "bytes":
        case "string": {
            try {
                data = yield* read_1.default(pointer, state);
            }
            catch (error) {
                return errors_1.handleDecodingError(dataType, error);
            }
            let lengthByte = data[Evm.Utils.WORD_SIZE - 1];
            if (lengthByte % 2 == 0) {
                // string lives in word, length is last byte / 2
                length = lengthByte / 2;
                debug("in-word; length %o", length);
                return yield* Bytes.Decode.decodeBytes(dataType, {
                    location: "storage",
                    range: {
                        from: { slot: pointer.range.from.slot, index: 0 },
                        to: { slot: pointer.range.from.slot, index: length - 1 }
                    }
                }, info);
            }
            else {
                let lengthAsBN = Conversion.toBN(data)
                    .subn(1)
                    .divn(2);
                try {
                    length = lengthAsBN.toNumber();
                }
                catch (_b) {
                    return {
                        //again with the TS failures...
                        type: dataType,
                        kind: "error",
                        error: {
                            kind: "OverlongArraysAndStringsNotImplementedError",
                            lengthAsBN
                        }
                    };
                }
                debug("new-word, length %o", length);
                return yield* Bytes.Decode.decodeBytes(dataType, {
                    location: "storage",
                    range: {
                        from: {
                            slot: {
                                path: pointer.range.from.slot,
                                offset: new bn_js_1.default(0),
                                hashPath: true
                            },
                            index: 0
                        },
                        length
                    }
                }, info);
            }
        }
        case "struct": {
            const typeId = dataType.id;
            const structAllocation = allocations[typeId];
            if (!structAllocation) {
                return {
                    type: dataType,
                    kind: "error",
                    error: {
                        kind: "UserDefinedTypeNotFoundError",
                        type: dataType
                    }
                };
            }
            let decodedMembers = [];
            const members = structAllocation.members;
            for (let index = 0; index < members.length; index++) {
                const memberAllocation = members[index];
                const memberPointer = memberAllocation.pointer;
                //the type system thinks memberPointer might also be a constant
                //definition pointer.  However, structs can't contain constants,
                //so *we* know it's not, and can safely coerce it.
                debug("pointer %O", pointer);
                const childRange = {
                    from: {
                        slot: {
                            path: pointer.range.from.slot,
                            offset: memberPointer.range.from.slot.offset.clone()
                            //note that memberPointer should have no path
                        },
                        index: memberPointer.range.from.index
                    },
                    to: {
                        slot: {
                            path: pointer.range.from.slot,
                            offset: memberPointer.range.to.slot.offset.clone()
                            //note that memberPointer should have no path
                        },
                        index: memberPointer.range.to.index
                    }
                };
                let storedType = info.userDefinedTypes[typeId];
                if (!storedType) {
                    return {
                        type: dataType,
                        kind: "error",
                        error: {
                            kind: "UserDefinedTypeNotFoundError",
                            type: dataType
                        }
                    };
                }
                let storedMemberType = storedType.memberTypes[index].type;
                let memberType = Format.Types.specifyLocation(storedMemberType, "storage");
                decodedMembers.push({
                    name: memberAllocation.name,
                    value: yield* decodeStorage(memberType, { location: "storage", range: childRange }, info)
                });
            }
            return {
                type: dataType,
                kind: "value",
                value: decodedMembers
            };
        }
        case "mapping": {
            debug("decoding mapping");
            const valueType = dataType.valueType;
            let valueSize;
            try {
                valueSize = allocate_1.storageSize(valueType, info.userDefinedTypes, allocations, info.currentContext.compiler);
            }
            catch (error) {
                return errors_1.handleDecodingError(dataType, error);
            }
            let decodedEntries = [];
            const baseSlot = pointer.range.from.slot;
            debug("baseSlot %o", baseSlot);
            debug("base slot address %o", Utils.slotAddress(baseSlot));
            const keySlots = info.mappingKeys.filter(({ path }) => Utils.slotAddress(baseSlot).eq(Utils.slotAddress(path)));
            for (const { key } of keySlots) {
                let valuePointer;
                if (Utils.isWordsLength(valueSize)) {
                    valuePointer = {
                        location: "storage",
                        range: {
                            from: {
                                slot: {
                                    key,
                                    path: baseSlot,
                                    offset: new bn_js_1.default(0)
                                },
                                index: 0
                            },
                            to: {
                                slot: {
                                    key,
                                    path: baseSlot,
                                    offset: new bn_js_1.default(valueSize.words - 1)
                                },
                                index: Evm.Utils.WORD_SIZE - 1
                            }
                        }
                    };
                }
                else {
                    valuePointer = {
                        location: "storage",
                        range: {
                            from: {
                                slot: {
                                    key,
                                    path: baseSlot,
                                    offset: new bn_js_1.default(0)
                                },
                                index: Evm.Utils.WORD_SIZE - valueSize.bytes
                            },
                            to: {
                                slot: {
                                    key,
                                    path: baseSlot,
                                    offset: new bn_js_1.default(0)
                                },
                                index: Evm.Utils.WORD_SIZE - 1
                            }
                        }
                    };
                }
                decodedEntries.push({
                    key,
                    value: yield* decodeStorage(valueType, valuePointer, info)
                });
            }
            return {
                type: dataType,
                kind: "value",
                value: decodedEntries
            };
        }
    }
}
exports.decodeStorageReference = decodeStorageReference;
//# sourceMappingURL=index.js.map