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
exports.decodeMemoryReferenceByAddress = exports.decodeMemory = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:memory:decode");
const read_1 = __importDefault(require("../../read"));
const Conversion = __importStar(require("../../conversion"));
const Format = __importStar(require("../../format"));
const Basic = __importStar(require("../../basic"));
const Bytes = __importStar(require("../../bytes"));
const Evm = __importStar(require("../../evm"));
const allocate_1 = require("../allocate");
const errors_1 = require("../../errors");
function* decodeMemory(dataType, pointer, info, options = {}) {
    if (Format.Types.isReferenceType(dataType)) {
        if (allocate_1.isSkippedInMemoryStructs(dataType)) {
            //special case; these types are always empty in memory
            return decodeMemorySkippedType(dataType);
        }
        else {
            return yield* decodeMemoryReferenceByAddress(dataType, pointer, info, options);
        }
    }
    else {
        return yield* Basic.Decode.decodeBasic(dataType, pointer, info, options);
    }
}
exports.decodeMemory = decodeMemory;
function decodeMemorySkippedType(dataType) {
    switch (dataType.typeClass) {
        case "mapping":
            return {
                type: dataType,
                kind: "value",
                value: []
            };
        case "array":
            return {
                type: dataType,
                kind: "value",
                value: []
            };
        //other cases should not arise!
    }
}
function* decodeMemoryReferenceByAddress(dataType, pointer, info, options = {}) {
    const { state } = info;
    const memoryVisited = options.memoryVisited || [];
    debug("pointer %o", pointer);
    let rawValue;
    try {
        rawValue = yield* read_1.default(pointer, state);
    }
    catch (error) {
        return errors_1.handleDecodingError(dataType, error);
    }
    let startPositionAsBN = Conversion.toBN(rawValue);
    let startPosition;
    try {
        startPosition = startPositionAsBN.toNumber();
    }
    catch (_a) {
        return {
            //again with the TS failures...
            type: dataType,
            kind: "error",
            error: {
                kind: "OverlargePointersNotImplementedError",
                pointerAsBN: startPositionAsBN
            }
        };
    }
    //startPosition may get modified later, so let's save the current
    //value for circularity detection purposes
    const objectPosition = startPosition;
    let rawLength;
    let lengthAsBN;
    let length;
    let seenPreviously;
    switch (dataType.typeClass) {
        case "bytes":
        case "string":
            //initial word contains length
            try {
                rawLength = yield* read_1.default({
                    location: "memory",
                    start: startPosition,
                    length: Evm.Utils.WORD_SIZE
                }, state);
            }
            catch (error) {
                return errors_1.handleDecodingError(dataType, error);
            }
            lengthAsBN = Conversion.toBN(rawLength);
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
            let childPointer = {
                location: "memory",
                start: startPosition + Evm.Utils.WORD_SIZE,
                length
            };
            return yield* Bytes.Decode.decodeBytes(dataType, childPointer, info);
        case "array": {
            //first: circularity check!
            seenPreviously = memoryVisited.indexOf(objectPosition);
            if (seenPreviously !== -1) {
                return {
                    type: dataType,
                    kind: "value",
                    reference: seenPreviously + 1,
                    value: [] //will be fixed later by the tie function
                };
            }
            //otherwise, decode as normal
            if (dataType.kind === "dynamic") {
                //initial word contains array length
                try {
                    rawLength = yield* read_1.default({
                        location: "memory",
                        start: startPosition,
                        length: Evm.Utils.WORD_SIZE
                    }, state);
                }
                catch (error) {
                    return errors_1.handleDecodingError(dataType, error);
                }
                lengthAsBN = Conversion.toBN(rawLength);
                startPosition += Evm.Utils.WORD_SIZE; //increment startPosition
                //to next word, as first word was used for length
            }
            else {
                lengthAsBN = dataType.length;
            }
            try {
                length = lengthAsBN.toNumber();
            }
            catch (_c) {
                return {
                    type: dataType,
                    kind: "error",
                    error: {
                        kind: "OverlongArraysAndStringsNotImplementedError",
                        lengthAsBN
                    }
                };
            }
            let memoryNowVisited = [objectPosition, ...memoryVisited];
            let baseType = dataType.baseType;
            let decodedChildren = [];
            for (let index = 0; index < length; index++) {
                decodedChildren.push(yield* decodeMemory(baseType, {
                    location: "memory",
                    start: startPosition + index * Evm.Utils.WORD_SIZE,
                    length: Evm.Utils.WORD_SIZE
                }, info, { memoryVisited: memoryNowVisited }));
            }
            return {
                type: dataType,
                kind: "value",
                value: decodedChildren
            };
        }
        case "struct": {
            //first: circularity check!
            seenPreviously = memoryVisited.indexOf(objectPosition);
            if (seenPreviously !== -1) {
                return {
                    type: dataType,
                    kind: "value",
                    reference: seenPreviously + 1,
                    value: [] //will be fixed later by the tie function
                };
            }
            //otherwise, decode as normal
            const { allocations: { memory: allocations } } = info;
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
            debug("structAllocation %O", structAllocation);
            let memoryNowVisited = [objectPosition, ...memoryVisited];
            let decodedMembers = [];
            for (let index = 0; index < structAllocation.members.length; index++) {
                const memberAllocation = structAllocation.members[index];
                const memberPointer = memberAllocation.pointer;
                const childPointer = {
                    location: "memory",
                    start: startPosition + memberPointer.start,
                    length: memberPointer.length //always equals WORD_SIZE or 0
                };
                let memberName = memberAllocation.name;
                let memberType = Format.Types.specifyLocation(memberAllocation.type, "memory");
                decodedMembers.push({
                    name: memberName,
                    value: yield* decodeMemory(memberType, childPointer, info, {
                        memoryVisited: memoryNowVisited
                    })
                });
            }
            return {
                type: dataType,
                kind: "value",
                value: decodedMembers
            };
        }
    }
}
exports.decodeMemoryReferenceByAddress = decodeMemoryReferenceByAddress;
//# sourceMappingURL=index.js.map