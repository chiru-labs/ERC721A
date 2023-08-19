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
exports.abiEntryHasStorageParameters = exports.abiEntryIsObviouslyIllTyped = exports.topicsCount = exports.definitionMatchesAbi = exports.abisMatch = exports.abiSelector = exports.abiTupleSignature = exports.abiSignature = exports.abiHasPayableFallback = exports.computeSelectors = exports.DEFAULT_CONSTRUCTOR_ABI = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:abi-data:utils");
// untyped import since no @types/web3-utils exists
const Web3Utils = require("web3-utils");
const Evm = __importStar(require("../evm"));
const Ast = __importStar(require("../ast"));
exports.DEFAULT_CONSTRUCTOR_ABI = {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable"
};
//note the return value only includes functions!
function computeSelectors(abi) {
    if (abi === undefined) {
        return undefined;
    }
    return Object.assign({}, ...abi
        .filter((abiEntry) => abiEntry.type === "function")
        .map((abiEntry) => ({
        [abiSelector(abiEntry)]: abiEntry
    })));
}
exports.computeSelectors = computeSelectors;
//does this ABI have a payable fallback (or receive) function?
function abiHasPayableFallback(abi) {
    if (abi === undefined) {
        return undefined;
    }
    return abi.some(abiEntry => (abiEntry.type === "fallback" || abiEntry.type === "receive") &&
        abiEntry.stateMutability === "payable");
}
exports.abiHasPayableFallback = abiHasPayableFallback;
//NOTE: this function returns the written out SIGNATURE, not the SELECTOR
function abiSignature(abiEntry) {
    return abiEntry.name + abiTupleSignature(abiEntry.inputs);
}
exports.abiSignature = abiSignature;
function abiTupleSignature(parameters) {
    let components = parameters.map(abiTypeSignature);
    return "(" + components.join(",") + ")";
}
exports.abiTupleSignature = abiTupleSignature;
function abiTypeSignature(parameter) {
    let tupleMatch = parameter.type.match(/tuple(.*)/);
    if (tupleMatch === null) {
        //does not start with "tuple"
        return parameter.type;
    }
    else {
        let tail = tupleMatch[1]; //everything after "tuple"
        let tupleSignature = abiTupleSignature(parameter.components);
        return tupleSignature + tail;
    }
}
function abiSelector(abiEntry) {
    let signature = abiSignature(abiEntry);
    //NOTE: web3's soliditySha3 has a problem if the empty
    //string is passed in.  Fortunately, that should never happen here.
    let hash = Web3Utils.soliditySha3({ type: "string", value: signature });
    switch (abiEntry.type) {
        case "event":
            return hash;
        case "function":
        case "error":
            return hash.slice(0, 2 + 2 * Evm.Utils.SELECTOR_SIZE); //arithmetic to account for hex string
    }
}
exports.abiSelector = abiSelector;
//note: undefined does not match itself :P
function abisMatch(entry1, entry2) {
    //we'll consider two abi entries to match if they have the same
    //type, name (if applicable), and inputs (if applicable).
    //since there's already a signature function, we can just use that.
    if (!entry1 || !entry2) {
        return false;
    }
    if (entry1.type !== entry2.type) {
        return false;
    }
    switch (entry1.type) {
        case "function":
        case "event":
        case "error":
            return (abiSignature(entry1) ===
                abiSignature(entry2));
        case "constructor":
            return (abiTupleSignature(entry1.inputs) ===
                abiTupleSignature(entry2.inputs));
        case "fallback":
        case "receive":
            return true;
    }
}
exports.abisMatch = abisMatch;
function definitionMatchesAbi(abiEntry, definition, referenceDeclarations) {
    try {
        return abisMatch(abiEntry, Ast.Utils.definitionToAbi(definition, referenceDeclarations));
    }
    catch (_) {
        return false; //if an exception occurs, well, that's not a match!
    }
}
exports.definitionMatchesAbi = definitionMatchesAbi;
function topicsCount(abiEntry) {
    let selectorCount = abiEntry.anonymous ? 0 : 1; //if the event is not anonymous, we must account for the selector
    return (abiEntry.inputs.filter(({ indexed }) => indexed).length + selectorCount);
}
exports.topicsCount = topicsCount;
function abiEntryIsObviouslyIllTyped(abiEntry) {
    switch (abiEntry.type) {
        case "fallback":
        case "receive":
            return false;
        case "constructor":
        case "event":
        case "error":
            return abiEntry.inputs.some(abiParameterIsObviouslyIllTyped);
        case "function":
            return (abiEntry.inputs.some(abiParameterIsObviouslyIllTyped) ||
                abiEntry.outputs.some(abiParameterIsObviouslyIllTyped));
    }
}
exports.abiEntryIsObviouslyIllTyped = abiEntryIsObviouslyIllTyped;
function abiParameterIsObviouslyIllTyped(abiParameter) {
    const legalBaseTypeClasses = [
        "uint",
        "int",
        "fixed",
        "ufixed",
        "bool",
        "address",
        "bytes",
        "string",
        "function",
        "tuple"
    ];
    const baseTypeClass = abiParameter.type.match(/^([a-z]*)/)[1];
    const baseTypeClassIsObviouslyWrong = !legalBaseTypeClasses.includes(baseTypeClass);
    if (abiParameter.components) {
        return (abiParameter.components.some(abiParameterIsObviouslyIllTyped) ||
            baseTypeClassIsObviouslyWrong);
    }
    else {
        return baseTypeClassIsObviouslyWrong;
    }
}
function abiEntryHasStorageParameters(abiEntry) {
    const isStorage = (parameter) => parameter.type.endsWith(" storage");
    return (abiEntry.type === "function" &&
        (abiEntry.inputs.some(isStorage) || abiEntry.outputs.some(isStorage)));
    //Note the lack of recursion!  Storage parameters can only occur at
    //top level so there's no need to recurse here
    //(they can also only occur for functions)
}
exports.abiEntryHasStorageParameters = abiEntryHasStorageParameters;
//# sourceMappingURL=utils.js.map