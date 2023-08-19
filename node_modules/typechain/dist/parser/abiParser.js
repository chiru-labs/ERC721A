"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConstantFn = exports.isConstant = exports.ensure0xPrefix = exports.extractDocumentation = exports.extractBytecode = exports.extractAbi = exports.getFunctionDocumentation = exports.parseEvent = exports.parse = void 0;
const js_sha3_1 = require("js-sha3");
const lodash_1 = require("lodash");
const debug_1 = require("../utils/debug");
const errors_1 = require("../utils/errors");
const parseEvmType_1 = require("./parseEvmType");
const normalizeName_1 = require("./normalizeName");
function parse(abi, rawName, documentation) {
    const constructors = [];
    let fallback;
    const functions = [];
    const events = [];
    abi.forEach((abiPiece) => {
        if (abiPiece.type === 'fallback') {
            if (fallback) {
                throw new Error(`Fallback function can't be defined more than once! ${JSON.stringify(abiPiece)} Previously defined: ${JSON.stringify(fallback)}`);
            }
            fallback = parseFallback(abiPiece);
            return;
        }
        if (abiPiece.type === 'constructor') {
            constructors.push(parseConstructor(abiPiece));
            return;
        }
        if (abiPiece.type === 'function') {
            functions.push(parseFunctionDeclaration(abiPiece, documentation));
            return;
        }
        if (abiPiece.type === 'event') {
            const eventAbi = abiPiece;
            events.push(parseEvent(eventAbi));
            return;
        }
        debug_1.debug(`Unrecognized abi element: ${abiPiece.type}`);
    });
    return {
        name: normalizeName_1.normalizeName(rawName),
        rawName,
        fallback,
        constructor: constructors,
        functions: lodash_1.groupBy(functions, (f) => f.name),
        events: lodash_1.groupBy(events, (e) => e.name),
        documentation: documentation ? lodash_1.omit(documentation, ['methods']) : undefined,
    };
}
exports.parse = parse;
function parseOutputs(outputs) {
    if (!outputs || outputs.length === 0) {
        return [{ name: '', type: { type: 'void' } }];
    }
    else {
        return outputs.map(parseRawAbiParameter);
    }
}
function parseEvent(abiPiece) {
    var _a;
    debug_1.debug(`Parsing event "${abiPiece.name}"`);
    return {
        name: abiPiece.name,
        isAnonymous: (_a = abiPiece.anonymous) !== null && _a !== void 0 ? _a : false,
        inputs: abiPiece.inputs.map(parseRawEventArg),
    };
}
exports.parseEvent = parseEvent;
function parseRawEventArg(eventArg) {
    return {
        name: parseEmptyAsUndefined(eventArg.name),
        isIndexed: eventArg.indexed,
        type: parseRawAbiParameterType(eventArg),
    };
}
function parseEmptyAsUndefined(smt) {
    if (smt === '') {
        return undefined;
    }
    return smt;
}
// if stateMutability is not available we will use old spec containing constant and payable
function findStateMutability(abiPiece) {
    if (abiPiece.stateMutability) {
        return abiPiece.stateMutability;
    }
    if (abiPiece.constant) {
        return 'view';
    }
    return abiPiece.payable ? 'payable' : 'nonpayable';
}
function getFunctionDocumentation(abiPiece, documentation) {
    const docKey = `${abiPiece.name}(${abiPiece.inputs.map(({ type }) => type).join(',')})`;
    return documentation && documentation.methods && documentation.methods[docKey];
}
exports.getFunctionDocumentation = getFunctionDocumentation;
function parseConstructor(abiPiece) {
    debug_1.debug(`Parsing constructor declaration`);
    return {
        name: 'constructor',
        inputs: abiPiece.inputs.map(parseRawAbiParameter),
        outputs: [],
        stateMutability: findStateMutability(abiPiece),
    };
}
function parseFallback(abiPiece) {
    debug_1.debug(`Parsing fallback declaration`);
    return {
        name: 'fallback',
        inputs: [],
        outputs: parseOutputs(abiPiece.outputs),
        stateMutability: findStateMutability(abiPiece),
    };
}
function parseFunctionDeclaration(abiPiece, documentation) {
    debug_1.debug(`Parsing function declaration "${abiPiece.name}"`);
    return {
        name: abiPiece.name,
        inputs: abiPiece.inputs.map(parseRawAbiParameter),
        outputs: parseOutputs(abiPiece.outputs),
        stateMutability: findStateMutability(abiPiece),
        documentation: getFunctionDocumentation(abiPiece, documentation),
    };
}
function parseRawAbiParameter(rawAbiParameter) {
    return {
        name: rawAbiParameter.name,
        type: parseRawAbiParameterType(rawAbiParameter),
    };
}
function parseRawAbiParameterType(rawAbiParameter) {
    const components = rawAbiParameter.components &&
        rawAbiParameter.components.map((component) => ({
            name: component.name,
            type: parseRawAbiParameterType(component),
        }));
    return parseEvmType_1.parseEvmType(rawAbiParameter.type, components, rawAbiParameter.internalType);
}
function extractAbi(rawJson) {
    let json;
    try {
        json = JSON.parse(rawJson);
    }
    catch (_a) {
        throw new errors_1.MalformedAbiError('Not a json');
    }
    if (!json) {
        throw new errors_1.MalformedAbiError('Not a json');
    }
    if (Array.isArray(json)) {
        return json;
    }
    if (Array.isArray(json.abi)) {
        return json.abi;
    }
    else if (json.compilerOutput && Array.isArray(json.compilerOutput.abi)) {
        return json.compilerOutput.abi;
    }
    throw new errors_1.MalformedAbiError('Not a valid ABI');
}
exports.extractAbi = extractAbi;
function extractBytecode(rawContents) {
    // When there are some unlinked libraries, the compiler replaces their addresses in calls with
    // "link references". There are many different kinds of those, depending on compiler version and usage.
    // Examples:
    // * `__TestLibrary___________________________`
    //   (truffle with solc 0.4.x?, just the contract name)
    // * `__./ContractWithLibrary.sol:TestLibrar__`
    //   (solc 0.4.x, `${fileName}:${contractName}` truncated at 36 chars)
    // * `__$8809803722eff063c8527a84f57d60014e$__`
    //   (solc 0.5.x, ``solidityKeccak256(['string'], [`${fileName}:${contractName}`])``, truncated )
    const bytecodeRegex = /^(0x)?(([0-9a-fA-F][0-9a-fA-F])|(__[a-zA-Z0-9/\\:_$.-]{36}__))+$/;
    // First try to see if this is a .bin file with just the bytecode, otherwise a json
    if (rawContents.match(bytecodeRegex))
        return extractLinkReferences(rawContents);
    let json;
    try {
        json = JSON.parse(rawContents);
    }
    catch (_a) {
        return undefined;
    }
    if (!json)
        return undefined;
    // `json.evm.bytecode` often has more information than `json.bytecode`, needs to be checked first
    if (json.evm && json.evm.bytecode && json.evm.bytecode.object && json.evm.bytecode.object.match(bytecodeRegex)) {
        return extractLinkReferences(json.evm.bytecode.object, json.evm.bytecode.linkReferences);
    }
    // handle json schema of @0x/sol-compiler
    if (json.compilerOutput &&
        json.compilerOutput.evm &&
        json.compilerOutput.evm.bytecode &&
        json.compilerOutput.evm.bytecode.object &&
        json.compilerOutput.evm.bytecode.object.match(bytecodeRegex)) {
        return extractLinkReferences(json.compilerOutput.evm.bytecode.object, json.compilerOutput.evm.bytecode.linkReferences);
    }
    if (json.bytecode && json.bytecode.match(bytecodeRegex)) {
        return extractLinkReferences(json.bytecode);
    }
    return undefined;
}
exports.extractBytecode = extractBytecode;
function extractDocumentation(rawContents) {
    let json;
    try {
        json = JSON.parse(rawContents);
    }
    catch (_a) {
        return undefined;
    }
    if (!json || (!json.devdoc && !json.userdoc))
        return undefined;
    const result = json.devdoc || {};
    // Merge devdoc and userdoc objects
    if (json.userdoc) {
        result.notice = json.userdoc.notice;
        if (!json.userdoc.methods)
            return result;
        result.methods = result.methods || {};
        Object.entries(json.userdoc.methods).forEach(([key, { notice }]) => {
            if (result.methods)
                result.methods[key] = { ...result.methods[key], notice };
        });
    }
    return result;
}
exports.extractDocumentation = extractDocumentation;
function extractLinkReferences(_bytecode, linkReferencesObj) {
    const bytecode = ensure0xPrefix(_bytecode);
    // See comment in `extractBytecode` for explanation.
    const allLinkReferencesRegex = /__[a-zA-Z0-9/\\:_$.-]{36}__/g;
    const allReferences = bytecode.match(allLinkReferencesRegex);
    if (!allReferences)
        return { bytecode };
    const uniqueReferences = Array.from(new Set(allReferences));
    const refToNameMap = linkReferencesObj ? extractLinkReferenceContractNames(linkReferencesObj) : {};
    const linkReferences = uniqueReferences.map((reference) => refToNameMap[reference] ? { reference, name: refToNameMap[reference] } : { reference });
    return { bytecode, linkReferences };
}
// Returns mapping from link reference (bytecode fake address) to readable contract name
function extractLinkReferenceContractNames(linkReferences) {
    // `evm.bytecode.linkReferences` example:
    // {
    //   "ContractWithLibrary.sol": {
    //     "TestLibrary": [
    //       { "length": 20, "start": 151 },
    //       { "length": 20, "start": 177 },
    //     ],
    //   },
    // },
    const nameMap = {};
    Object.keys(linkReferences).forEach((contractFile) => Object.keys(linkReferences[contractFile]).forEach((contractName) => {
        const contractPath = `${contractFile}:${contractName}`;
        const contractRef = `__$${js_sha3_1.keccak_256(contractPath).slice(0, 34)}$__`;
        nameMap[contractRef] = contractPath;
    }));
    return nameMap;
}
function ensure0xPrefix(hexString) {
    if (hexString.startsWith('0x'))
        return hexString;
    return '0x' + hexString;
}
exports.ensure0xPrefix = ensure0xPrefix;
function isConstant(fn) {
    return ((fn.stateMutability === 'pure' || fn.stateMutability === 'view') &&
        fn.inputs.length === 0 &&
        fn.outputs.length === 1);
}
exports.isConstant = isConstant;
function isConstantFn(fn) {
    return (fn.stateMutability === 'pure' || fn.stateMutability === 'view') && !isConstant(fn);
}
exports.isConstantFn = isConstantFn;
//# sourceMappingURL=abiParser.js.map