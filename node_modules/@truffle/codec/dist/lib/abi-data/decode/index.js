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
exports.decodeAbiReferenceStatic = exports.decodeAbiReferenceByAddress = exports.decodeAbi = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:abi-data:decode");
const read_1 = __importDefault(require("../../read"));
const Conversion = __importStar(require("../../conversion"));
const Basic = __importStar(require("../../basic"));
const Bytes = __importStar(require("../../bytes"));
const Format = __importStar(require("../../format"));
const Evm = __importStar(require("../../evm"));
const allocate_1 = require("../allocate");
const errors_1 = require("../../errors");
function* decodeAbi(dataType, pointer, info, options = {}) {
    if (Format.Types.isReferenceType(dataType) ||
        dataType.typeClass === "tuple") {
        //I don't want tuples to be considered a reference type, but it makes sense
        //to group them for this purpose
        let dynamic;
        try {
            dynamic = allocate_1.abiSizeInfo(dataType, info.allocations.abi).dynamic;
        }
        catch (error) {
            return errors_1.handleDecodingError(dataType, error, options.strictAbiMode);
        }
        if (dynamic) {
            return yield* decodeAbiReferenceByAddress(dataType, pointer, info, options);
        }
        else {
            return yield* decodeAbiReferenceStatic(dataType, pointer, info, options);
        }
    }
    else {
        debug("pointer %o", pointer);
        return yield* Basic.Decode.decodeBasic(dataType, pointer, info, options);
    }
}
exports.decodeAbi = decodeAbi;
function* decodeAbiReferenceByAddress(dataType, pointer, info, options = {}) {
    let { strictAbiMode: strict, abiPointerBase: base, lengthOverride } = options;
    base = base || 0; //in case base was undefined
    const { allocations: { abi: allocations }, state } = info;
    debug("pointer %o", pointer);
    //this variable holds the location we should look to *next*
    //stack pointers point to calldata; other pointers point to same location
    const location = pointer.location === "stack" || pointer.location === "stackliteral"
        ? "calldata"
        : pointer.location;
    if (pointer.location !== "stack" && pointer.location !== "stackliteral") {
        //length overrides are only applicable when you're decoding a pointer
        //from the stack!  otherwise they must be ignored!
        lengthOverride = undefined;
    }
    let rawValue;
    try {
        rawValue = yield* read_1.default(pointer, state);
    }
    catch (error) {
        return errors_1.handleDecodingError(dataType, error, strict);
    }
    let rawValueAsBN = Conversion.toBN(rawValue);
    debug("rawValue: %O", rawValue);
    debug("rawValueAsBN: %O", rawValueAsBN);
    let rawValueAsNumber;
    try {
        rawValueAsNumber = rawValueAsBN.toNumber();
    }
    catch (_a) {
        let error = {
            kind: "OverlargePointersNotImplementedError",
            pointerAsBN: rawValueAsBN
        };
        if (strict) {
            throw new errors_1.StopDecodingError(error);
        }
        return {
            //again with the TS failures...
            type: dataType,
            kind: "error",
            error
        };
    }
    let startPosition = rawValueAsNumber + base;
    debug("startPosition %d", startPosition);
    let dynamic;
    let size;
    try {
        ({ dynamic, size } = allocate_1.abiSizeInfo(dataType, allocations));
    }
    catch (error) {
        return errors_1.handleDecodingError(dataType, error, strict);
    }
    if (!dynamic) {
        //this will only come up when called from stack.ts
        let staticPointer = {
            location,
            start: startPosition,
            length: size
        };
        return yield* decodeAbiReferenceStatic(dataType, staticPointer, info, options);
    }
    let length;
    let lengthAsBN;
    let rawLength;
    switch (dataType.typeClass) {
        case "bytes":
        case "string":
            //initial word contains length (unless an override was given)
            if (lengthOverride !== undefined) {
                lengthAsBN = lengthOverride;
                //note in this case we do *not* increment start position;
                //if a length override is given, that means the given start
                //position skips over the length word!
            }
            else {
                try {
                    rawLength = yield* read_1.default({
                        location,
                        start: startPosition,
                        length: Evm.Utils.WORD_SIZE
                    }, state);
                }
                catch (error) {
                    return errors_1.handleDecodingError(dataType, error, strict);
                }
                lengthAsBN = Conversion.toBN(rawLength);
                startPosition += Evm.Utils.WORD_SIZE; //increment start position after reading length
                //so it'll be set up to read the data
            }
            if (strict && lengthAsBN.gtn(state[location].length)) {
                //you may notice that the comparison is a bit crude; that's OK, this is
                //just to prevent huge numbers from DOSing us, other errors will still
                //be caught regardless
                throw new errors_1.StopDecodingError({
                    kind: "OverlongArrayOrStringStrictModeError",
                    lengthAsBN,
                    dataLength: state[location].length
                });
            }
            try {
                length = lengthAsBN.toNumber();
            }
            catch (_b) {
                //note: if we're in this situation, we can assume we're not in strict mode,
                //as the strict case was handled above
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
                location,
                start: startPosition,
                length
            };
            return yield* Bytes.Decode.decodeBytes(dataType, childPointer, info, options);
        case "array":
            if (dataType.kind === "static") {
                //static-length array
                lengthAsBN = dataType.length;
                //note we don't increment start position; static arrays don't
                //include a length word!
            }
            else if (lengthOverride !== undefined) {
                debug("override: %o", lengthOverride);
                //dynamic-length array, but with length override
                lengthAsBN = lengthOverride;
                //we don't increment start position; if a length override was
                //given, that means the pointer skipped the length word!
            }
            else {
                //dynamic-length array, read length from data
                //initial word contains array length
                try {
                    rawLength = yield* read_1.default({
                        location,
                        start: startPosition,
                        length: Evm.Utils.WORD_SIZE
                    }, state);
                }
                catch (error) {
                    return errors_1.handleDecodingError(dataType, error, strict);
                }
                lengthAsBN = Conversion.toBN(rawLength);
                startPosition += Evm.Utils.WORD_SIZE; //increment startPosition
                //to next word, as first word was used for length
            }
            if (strict && lengthAsBN.gtn(state[location].length)) {
                //you may notice that the comparison is a bit crude; that's OK, this is
                //just to prevent huge numbers from DOSing us, other errors will still
                //be caught regardless
                throw new errors_1.StopDecodingError({
                    kind: "OverlongArraysAndStringsNotImplementedError",
                    lengthAsBN,
                    dataLength: state[location].length
                });
            }
            try {
                length = lengthAsBN.toNumber();
            }
            catch (_c) {
                //again, if we get here, we can assume we're not in strict mode
                return {
                    type: dataType,
                    kind: "error",
                    error: {
                        kind: "OverlongArraysAndStringsNotImplementedError",
                        lengthAsBN
                    }
                };
            }
            //note: I've written this fairly generically, but it is worth noting that
            //since this array is of dynamic type, we know that if it's static length
            //then size must be EVM.WORD_SIZE
            let baseSize;
            try {
                baseSize = allocate_1.abiSizeInfo(dataType.baseType, allocations).size;
            }
            catch (error) {
                return errors_1.handleDecodingError(dataType, error, strict);
            }
            let decodedChildren = [];
            for (let index = 0; index < length; index++) {
                decodedChildren.push(yield* decodeAbi(dataType.baseType, {
                    location,
                    start: startPosition + index * baseSize,
                    length: baseSize
                }, info, Object.assign(Object.assign({}, options), { abiPointerBase: startPosition }))); //pointer base is always start of list, never the length
            }
            return {
                type: dataType,
                kind: "value",
                value: decodedChildren
            };
        case "struct":
            return yield* decodeAbiStructByPosition(dataType, location, startPosition, info, options);
        case "tuple":
            return yield* decodeAbiTupleByPosition(dataType, location, startPosition, info, options);
    }
}
exports.decodeAbiReferenceByAddress = decodeAbiReferenceByAddress;
function* decodeAbiReferenceStatic(dataType, pointer, info, options = {}) {
    debug("static");
    debug("pointer %o", pointer);
    const location = pointer.location;
    switch (dataType.typeClass) {
        case "array":
            //we're in the static case, so we know the array must be statically sized
            const lengthAsBN = dataType.length;
            let length;
            try {
                length = lengthAsBN.toNumber();
            }
            catch (_a) {
                //note: since this is the static case, we don't bother including the stronger
                //strict-mode guard against getting DOSed by large array sizes, since in this
                //case we're not reading the size from the input; if there's a huge static size
                //array, well, we'll just have to deal with it
                let error = {
                    kind: "OverlongArraysAndStringsNotImplementedError",
                    lengthAsBN
                };
                if (options.strictAbiMode) {
                    throw new errors_1.StopDecodingError(error);
                }
                return {
                    type: dataType,
                    kind: "error",
                    error
                };
            }
            let baseSize;
            try {
                baseSize = allocate_1.abiSizeInfo(dataType.baseType, info.allocations.abi).size;
            }
            catch (error) {
                return errors_1.handleDecodingError(dataType, error, options.strictAbiMode);
            }
            let decodedChildren = [];
            for (let index = 0; index < length; index++) {
                decodedChildren.push(yield* decodeAbi(dataType.baseType, {
                    location,
                    start: pointer.start + index * baseSize,
                    length: baseSize
                }, info, options));
            }
            return {
                type: dataType,
                kind: "value",
                value: decodedChildren
            };
        case "struct":
            return yield* decodeAbiStructByPosition(dataType, location, pointer.start, info, options);
        case "tuple":
            return yield* decodeAbiTupleByPosition(dataType, location, pointer.start, info, options);
    }
}
exports.decodeAbiReferenceStatic = decodeAbiReferenceStatic;
//note that this function takes the start position as a *number*; it does not take a pointer
function* decodeAbiStructByPosition(dataType, location, startPosition, info, options = {}) {
    const { allocations: { abi: allocations } } = info;
    const typeLocation = location === "calldata" ? "calldata" : null; //other abi locations are not valid type locations
    const typeId = dataType.id;
    const structAllocation = allocations[typeId];
    if (!structAllocation) {
        let error = {
            kind: "UserDefinedTypeNotFoundError",
            type: dataType
        };
        if (options.strictAbiMode || options.allowRetry) {
            throw new errors_1.StopDecodingError(error, true);
            //note that we allow a retry if we couldn't locate the allocation!
        }
        return {
            type: dataType,
            kind: "error",
            error
        };
    }
    let decodedMembers = [];
    for (let index = 0; index < structAllocation.members.length; index++) {
        const memberAllocation = structAllocation.members[index];
        const memberPointer = memberAllocation.pointer;
        const childPointer = {
            location,
            start: startPosition + memberPointer.start,
            length: memberPointer.length
        };
        let memberName = memberAllocation.name;
        let memberType = Format.Types.specifyLocation(memberAllocation.type, typeLocation);
        decodedMembers.push({
            name: memberName,
            value: yield* decodeAbi(memberType, childPointer, info, Object.assign(Object.assign({}, options), { abiPointerBase: startPosition }))
            //note that the base option is only needed in the dynamic case, but we're being indiscriminate
        });
    }
    return {
        type: dataType,
        kind: "value",
        value: decodedMembers
    };
}
//note that this function takes the start position as a *number*; it does not take a pointer
function* decodeAbiTupleByPosition(dataType, location, startPosition, info, options = {}) {
    //WARNING: This case is written in a way that involves a bunch of unnecessary recomputation!
    //I'm writing it this way anyway for simplicity, to avoid rewriting the decoder
    //However it may be worth revisiting this in the future if performance turns out to be a problem
    //(changing this may be pretty hard though)
    let decodedMembers = [];
    let position = startPosition;
    for (const { name, type: memberType } of dataType.memberTypes) {
        const memberSize = allocate_1.abiSizeInfo(memberType, info.allocations.abi).size;
        const childPointer = {
            location,
            start: position,
            length: memberSize
        };
        decodedMembers.push({
            name,
            value: yield* decodeAbi(memberType, childPointer, info, Object.assign(Object.assign({}, options), { abiPointerBase: startPosition }))
            //note that the base option is only needed in the dynamic case, but we're being indiscriminate
        });
        position += memberSize;
    }
    return {
        type: dataType,
        kind: "value",
        value: decodedMembers
    };
}
//# sourceMappingURL=index.js.map