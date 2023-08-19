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
exports.storageSize = exports.getStateAllocations = exports.getStorageAllocations = exports.UnknownBaseContractIdError = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:storage:allocate");
const Compiler = __importStar(require("../../compiler"));
const Common = __importStar(require("../../common"));
const Basic = __importStar(require("../../basic"));
const Utils = __importStar(require("../utils"));
const Ast = __importStar(require("../../ast"));
const Evm = __importStar(require("../../evm"));
const Format = __importStar(require("../../format"));
const bn_js_1 = __importDefault(require("bn.js"));
const lodash_partition_1 = __importDefault(require("lodash.partition"));
class UnknownBaseContractIdError extends Error {
    constructor(derivedId, derivedName, derivedKind, baseId) {
        const message = `Cannot locate base contract ID ${baseId} of ${derivedKind} ${derivedName} (ID ${derivedId})`;
        super(message);
        this.name = "UnknownBaseContractIdError";
        this.derivedId = derivedId;
        this.derivedName = derivedName;
        this.derivedKind = derivedKind;
        this.baseId = baseId;
    }
}
exports.UnknownBaseContractIdError = UnknownBaseContractIdError;
//contracts contains only the contracts to be allocated; any base classes not
//being allocated should just be in referenceDeclarations
function getStorageAllocations(userDefinedTypesByCompilation) {
    let allocations = {};
    for (const compilation of Object.values(userDefinedTypesByCompilation)) {
        const { compiler, types: userDefinedTypes } = compilation;
        for (const dataType of Object.values(compilation.types)) {
            if (dataType.typeClass === "struct") {
                try {
                    allocations = allocateStruct(dataType, userDefinedTypes, allocations, compiler);
                }
                catch (_a) {
                    //if allocation fails... oh well, allocation fails, we do nothing and just move on :P
                    //note: a better way of handling this would probably be to *mark* it
                    //as failed rather than throwing an exception as that would lead to less
                    //recomputation, but this is simpler and I don't think the recomputation
                    //should really be a problem
                }
            }
        }
    }
    return allocations;
}
exports.getStorageAllocations = getStorageAllocations;
/**
 * This function gets allocations for the state variables of the contracts;
 * this is distinct from getStorageAllocations, which gets allocations for
 * storage structs.
 *
 * While mostly state variables are kept in storage, constant ones are not.
 * And immutable ones, once those are introduced, will be kept in code!
 * (But those don't exist yet so this function doesn't handle them yet.)
 */
function getStateAllocations(contracts, referenceDeclarations, userDefinedTypes, storageAllocations, existingAllocations = {}) {
    let allocations = existingAllocations;
    for (const contractInfo of contracts) {
        let { contractNode: contract, immutableReferences, compiler, compilationId } = contractInfo;
        try {
            allocations = allocateContractState(contract, immutableReferences, compilationId, compiler, referenceDeclarations[compilationId], userDefinedTypes, storageAllocations, allocations);
        }
        catch (_a) {
            //we're just going to allow failure here and catch the problem elsewhere
        }
    }
    return allocations;
}
exports.getStateAllocations = getStateAllocations;
function allocateStruct(dataType, userDefinedTypes, existingAllocations, compiler) {
    //NOTE: dataType here should be a *stored* type!
    //it is up to the caller to take care of this
    return allocateMembers(dataType.id, dataType.memberTypes, userDefinedTypes, existingAllocations, compiler);
}
function allocateMembers(parentId, members, userDefinedTypes, existingAllocations, compiler) {
    let offset = 0; //will convert to BN when placing in slot
    let index = Evm.Utils.WORD_SIZE - 1;
    //don't allocate things that have already been allocated
    if (parentId in existingAllocations) {
        return existingAllocations;
    }
    let allocations = Object.assign({}, existingAllocations); //otherwise, we'll be adding to this, so we better clone
    //otherwise, we need to allocate
    let memberAllocations = [];
    for (const member of members) {
        let size;
        ({ size, allocations } = storageSizeAndAllocate(member.type, userDefinedTypes, allocations, compiler));
        //if it's sized in words (and we're not at the start of slot) we need to start on a new slot
        //if it's sized in bytes but there's not enough room, we also need a new slot
        if (Utils.isWordsLength(size)
            ? index < Evm.Utils.WORD_SIZE - 1
            : size.bytes > index + 1) {
            index = Evm.Utils.WORD_SIZE - 1;
            offset += 1;
        }
        //otherwise, we remain in place
        let range;
        if (Utils.isWordsLength(size)) {
            //words case
            range = {
                from: {
                    slot: {
                        offset: new bn_js_1.default(offset) //start at the current slot...
                    },
                    index: 0 //...at the beginning of the word.
                },
                to: {
                    slot: {
                        offset: new bn_js_1.default(offset + size.words - 1) //end at the current slot plus # of words minus 1...
                    },
                    index: Evm.Utils.WORD_SIZE - 1 //...at the end of the word.
                }
            };
        }
        else {
            //bytes case
            range = {
                from: {
                    slot: {
                        offset: new bn_js_1.default(offset) //start at the current slot...
                    },
                    index: index - (size.bytes - 1) //...early enough to fit what's being allocated.
                },
                to: {
                    slot: {
                        offset: new bn_js_1.default(offset) //end at the current slot...
                    },
                    index: index //...at the current position.
                }
            };
        }
        memberAllocations.push({
            name: member.name,
            type: member.type,
            pointer: {
                location: "storage",
                range
            }
        });
        //finally, adjust the current position.
        //if it was sized in words, move down that many slots and reset position w/in slot
        if (Utils.isWordsLength(size)) {
            offset += size.words;
            index = Evm.Utils.WORD_SIZE - 1;
        }
        //if it was sized in bytes, move down an appropriate number of bytes.
        else {
            index -= size.bytes;
            //but if this puts us into the next word, move to the next word.
            if (index < 0) {
                index = Evm.Utils.WORD_SIZE - 1;
                offset += 1;
            }
        }
    }
    //finally, let's determine the overall siz; we're dealing with a struct, so
    //the size is measured in words
    //it's one plus the last word used, i.e. one plus the current word... unless the
    //current word remains entirely unused, then it's just the current word
    //SPECIAL CASE: if *nothing* has been used, allocate a single word (that's how
    //empty structs behave in versions where they're legal)
    let totalSize;
    if (index === Evm.Utils.WORD_SIZE - 1 && offset !== 0) {
        totalSize = { words: offset };
    }
    else {
        totalSize = { words: offset + 1 };
    }
    //having made our allocation, let's add it to allocations!
    allocations[parentId] = {
        members: memberAllocations,
        size: totalSize
    };
    //...and we're done!
    return allocations;
}
function getStateVariables(contractNode) {
    // process for state variables
    return contractNode.nodes.filter((node) => node.nodeType === "VariableDeclaration" && node.stateVariable);
}
function allocateContractState(contract, immutableReferences, compilationId, compiler, referenceDeclarations, userDefinedTypes, storageAllocations, existingAllocations = {}) {
    //we're going to do a 2-deep clone here
    let allocations = Object.assign({}, ...Object.entries(existingAllocations).map(([compilationId, compilationAllocations]) => ({
        [compilationId]: Object.assign({}, compilationAllocations)
    })));
    if (!immutableReferences) {
        immutableReferences = {}; //also, let's set this up for convenience
    }
    //base contracts are listed from most derived to most base, so we
    //have to reverse before processing, but reverse() is in place, so we
    //clone with slice first
    let linearizedBaseContractsFromBase = contract.linearizedBaseContracts
        .slice()
        .reverse();
    //first, let's get all the variables under consideration
    let variables = [].concat(...linearizedBaseContractsFromBase.map((id) => {
        let baseNode = referenceDeclarations[id];
        if (baseNode === undefined) {
            throw new UnknownBaseContractIdError(contract.id, contract.name, contract.contractKind, id);
        }
        return getStateVariables(baseNode).map(definition => ({
            definition,
            definedIn: baseNode
        }));
    }));
    //just in case the constant field ever gets removed
    const isConstant = (definition) => definition.constant || definition.mutability === "constant";
    //now: we split the variables into storage, constant, and code
    let [constantVariables, variableVariables] = lodash_partition_1.default(variables, variable => isConstant(variable.definition));
    //why use this function instead of just checking
    //definition.mutability?
    //because of a bug in Solidity 0.6.5 that causes the mutability field
    //not to exist.  So, we also have to check against immutableReferences.
    const isImmutable = (definition) => definition.mutability === "immutable" ||
        definition.id.toString() in immutableReferences;
    let [immutableVariables, storageVariables] = lodash_partition_1.default(variableVariables, variable => isImmutable(variable.definition));
    //transform storage variables into data types
    const storageVariableTypes = storageVariables.map(variable => ({
        name: variable.definition.name,
        type: Ast.Import.definitionToType(variable.definition, compilationId, compiler)
    }));
    //let's allocate the storage variables using a fictitious ID
    const id = "-1";
    const storageVariableStorageAllocations = allocateMembers(id, storageVariableTypes, userDefinedTypes, storageAllocations, compiler)[id];
    //transform to new format
    const storageVariableAllocations = storageVariables.map(({ definition, definedIn }, index) => ({
        definition,
        definedIn,
        compilationId,
        pointer: storageVariableStorageAllocations.members[index].pointer
    }));
    //now let's create allocations for the immutables
    let immutableVariableAllocations = immutableVariables.map(({ definition, definedIn }) => {
        let references = immutableReferences[definition.id.toString()] || [];
        let pointer;
        if (references.length === 0) {
            pointer = {
                location: "nowhere"
            };
        }
        else {
            pointer = {
                location: "code",
                start: references[0].start,
                length: references[0].length
            };
        }
        return {
            definition,
            definedIn,
            compilationId,
            pointer
        };
    });
    //and let's create allocations for the constants
    let constantVariableAllocations = constantVariables.map(({ definition, definedIn }) => ({
        definition,
        definedIn,
        compilationId,
        pointer: {
            location: "definition",
            definition: definition.value
        }
    }));
    //now, reweave the three together
    let contractAllocation = [];
    for (let variable of variables) {
        let arrayToGrabFrom = isConstant(variable.definition)
            ? constantVariableAllocations
            : isImmutable(variable.definition)
                ? immutableVariableAllocations
                : storageVariableAllocations;
        contractAllocation.push(arrayToGrabFrom.shift()); //note that push and shift both modify!
    }
    //finally, set things and return
    if (!allocations[compilationId]) {
        allocations[compilationId] = {};
    }
    allocations[compilationId][contract.id] = {
        members: contractAllocation
    };
    return allocations;
}
//NOTE: This wrapper function is for use in decoding ONLY, after allocation is done.
//The allocator should (and does) instead use a direct call to storageSizeAndAllocate,
//not to the wrapper, because it may need the allocations returned.
function storageSize(dataType, userDefinedTypes, allocations, compiler) {
    return storageSizeAndAllocate(dataType, userDefinedTypes, allocations, compiler).size;
}
exports.storageSize = storageSize;
function storageSizeAndAllocate(dataType, userDefinedTypes, existingAllocations, compiler) {
    //we'll only directly handle reference types here;
    //direct types will be handled by dispatching to Basic.Allocate.byteLength
    //in the default case
    switch (dataType.typeClass) {
        case "bytes": {
            switch (dataType.kind) {
                case "static":
                    //really a basic type :)
                    return {
                        size: {
                            bytes: Basic.Allocate.byteLength(dataType, userDefinedTypes)
                        },
                        allocations: existingAllocations
                    };
                case "dynamic":
                    return {
                        size: { words: 1 },
                        allocations: existingAllocations
                    };
            }
        }
        case "string":
        case "mapping":
            return {
                size: { words: 1 },
                allocations: existingAllocations
            };
        case "array": {
            switch (dataType.kind) {
                case "dynamic":
                    return {
                        size: { words: 1 },
                        allocations: existingAllocations
                    };
                case "static":
                    //static array case
                    const length = dataType.length.toNumber(); //warning! but if it's too big we have a problem
                    if (length === 0) {
                        //in versions of Solidity where it's legal, arrays of length 0 still take up 1 word
                        return {
                            size: { words: 1 },
                            allocations: existingAllocations
                        };
                    }
                    let { size: baseSize, allocations } = storageSizeAndAllocate(dataType.baseType, userDefinedTypes, existingAllocations);
                    if (!Utils.isWordsLength(baseSize)) {
                        //bytes case
                        const perWord = Math.floor(Evm.Utils.WORD_SIZE / baseSize.bytes);
                        debug("length %o", length);
                        const numWords = Math.ceil(length / perWord);
                        return {
                            size: { words: numWords },
                            allocations
                        };
                    }
                    else {
                        //words case
                        return {
                            size: { words: baseSize.words * length },
                            allocations
                        };
                    }
            }
        }
        case "struct": {
            let allocations = existingAllocations;
            let allocation = allocations[dataType.id]; //may be undefined!
            if (allocation === undefined) {
                //if we don't find an allocation, we'll have to do the allocation ourselves
                const storedType = (userDefinedTypes[dataType.id]);
                if (!storedType) {
                    throw new Common.UnknownUserDefinedTypeError(dataType.id, Format.Types.typeString(dataType));
                }
                allocations = allocateStruct(storedType, userDefinedTypes, existingAllocations);
                allocation = allocations[dataType.id];
            }
            //having found our allocation, we can just look up its size
            return {
                size: allocation.size,
                allocations
            };
        }
        case "userDefinedValueType":
            if (Compiler.Utils.solidityFamily(compiler) === "0.8.7+") {
                //UDVTs were introduced in Solidity 0.8.8.  However, in that version,
                //and that version only, they have a bug where they always take up a
                //full word in storage regardless of the size of the underlying type.
                return {
                    size: { words: 1 },
                    allocations: existingAllocations
                };
            }
        //otherwise, treat them normally
        //DELIBERATE FALL-TRHOUGH
        default:
            //otherwise, it's a direct type
            return {
                size: {
                    bytes: Basic.Allocate.byteLength(dataType, userDefinedTypes)
                },
                allocations: existingAllocations
            };
    }
}
//# sourceMappingURL=index.js.map