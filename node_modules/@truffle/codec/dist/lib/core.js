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
exports.decodeRevert = exports.decodeReturndata = exports.decodeEvent = exports.decodeCalldata = exports.decodeVariable = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:core");
const Ast = __importStar(require("./ast"));
const AbiData = __importStar(require("./abi-data"));
const Topic = __importStar(require("./topic"));
const Evm = __importStar(require("./evm"));
const Contexts = __importStar(require("./contexts"));
const abify_1 = require("./abify");
const Conversion = __importStar(require("./conversion"));
const errors_1 = require("./errors");
const read_1 = __importDefault(require("./read"));
const decode_1 = __importDefault(require("./decode"));
// untyped import since no @types/web3-utils exists
const Web3Utils = require("web3-utils");
/**
 * @Category Decoding
 */
function* decodeVariable(definition, pointer, info, compilationId) {
    let compiler = info.currentContext.compiler;
    let dataType = Ast.Import.definitionToType(definition, compilationId, compiler);
    return yield* decode_1.default(dataType, pointer, info); //no need to pass an offset
}
exports.decodeVariable = decodeVariable;
/**
 * @Category Decoding
 */
function* decodeCalldata(info, isConstructor //ignored if context! trust context instead if have
) {
    const context = info.currentContext;
    if (context === null) {
        //if we don't know the contract ID, we can't decode
        if (isConstructor) {
            return {
                kind: "create",
                decodingMode: "full",
                bytecode: Conversion.toHexString(info.state.calldata)
            };
        }
        else {
            return {
                kind: "unknown",
                decodingMode: "full",
                data: Conversion.toHexString(info.state.calldata)
            };
        }
    }
    const contextHash = context.context;
    const contractType = Contexts.Import.contextToType(context);
    isConstructor = context.isConstructor;
    const allocations = info.allocations.calldata;
    let allocation;
    let selector;
    //first: is this a creation call?
    if (isConstructor) {
        allocation = (allocations.constructorAllocations[contextHash] || { input: undefined }).input;
    }
    else {
        //skipping any error-handling on this read, as a calldata read can't throw anyway
        let rawSelector = yield* read_1.default({
            location: "calldata",
            start: 0,
            length: Evm.Utils.SELECTOR_SIZE
        }, info.state);
        selector = Conversion.toHexString(rawSelector);
        allocation = ((allocations.functionAllocations[contextHash] || {})[selector] || {
            input: undefined
        }).input;
    }
    if (allocation === undefined) {
        let abiEntry = null;
        if (info.state.calldata.length === 0) {
            //to hell with reads, let's just be direct
            abiEntry = context.fallbackAbi.receive || context.fallbackAbi.fallback;
        }
        else {
            abiEntry = context.fallbackAbi.fallback;
        }
        return {
            kind: "message",
            class: contractType,
            abi: abiEntry,
            data: Conversion.toHexString(info.state.calldata),
            decodingMode: "full"
        };
    }
    let decodingMode = allocation.allocationMode; //starts out this way, degrades to ABI if necessary
    debug("calldata decoding mode: %s", decodingMode);
    //you can't map with a generator, so we have to do this map manually
    let decodedArguments = [];
    for (const argumentAllocation of allocation.arguments) {
        let value;
        let dataType = decodingMode === "full"
            ? argumentAllocation.type
            : abify_1.abifyType(argumentAllocation.type, info.userDefinedTypes);
        try {
            value = yield* decode_1.default(dataType, argumentAllocation.pointer, info, {
                abiPointerBase: allocation.offset,
                allowRetry: decodingMode === "full"
            });
        }
        catch (error) {
            if (error instanceof errors_1.StopDecodingError &&
                error.allowRetry &&
                decodingMode === "full") {
                debug("problem! retrying as ABI");
                debug("error: %O", error);
                //if a retry happens, we've got to do several things in order to switch to ABI mode:
                //1. mark that we're switching to ABI mode;
                decodingMode = "abi";
                //2. abify all previously decoded values;
                decodedArguments = decodedArguments.map(argumentDecoding => (Object.assign(Object.assign({}, argumentDecoding), { value: abify_1.abifyResult(argumentDecoding.value, info.userDefinedTypes) })));
                //3. retry this particular decode in ABI mode.
                //(no try/catch on this one because we can't actually handle errors here!
                //not that they should be occurring)
                value = yield* decode_1.default(abify_1.abifyType(argumentAllocation.type, info.userDefinedTypes), //type is now abified!
                argumentAllocation.pointer, info, {
                    abiPointerBase: allocation.offset
                });
                //4. the remaining parameters will then automatically be decoded in ABI mode due to (1),
                //so we don't need to do anything special there.
            }
            else {
                //we shouldn't be getting other exceptions, but if we do, we don't know
                //how to handle them, so uhhhh just rethrow I guess??
                throw error;
            }
        }
        const name = argumentAllocation.name;
        decodedArguments.push(name //deliberate general falsiness test
            ? { name, value }
            : { value });
    }
    if (isConstructor) {
        return {
            kind: "constructor",
            class: contractType,
            arguments: decodedArguments,
            abi: allocation.abi,
            bytecode: Conversion.toHexString(info.state.calldata.slice(0, allocation.offset)),
            decodingMode
        };
    }
    else {
        return {
            kind: "function",
            class: contractType,
            abi: allocation.abi,
            arguments: decodedArguments,
            selector,
            decodingMode
        };
    }
}
exports.decodeCalldata = decodeCalldata;
/**
 * @Category Decoding
 */
function* decodeEvent(info, address, options = {}) {
    const allocations = info.allocations.event;
    const extras = options.extras || "off";
    let rawSelector;
    let selector;
    let contractAllocations; //for non-anonymous events
    let libraryAllocations; //similar
    let contractAnonymousAllocations;
    let libraryAnonymousAllocations;
    const topicsCount = info.state.eventtopics.length;
    //yeah, it's not great to read directly from the state like this (bypassing read), but what are you gonna do?
    if (allocations[topicsCount]) {
        if (topicsCount > 0) {
            rawSelector = yield* read_1.default({
                location: "eventtopic",
                topic: 0
            }, info.state);
            selector = Conversion.toHexString(rawSelector);
            if (allocations[topicsCount].bySelector[selector]) {
                ({
                    contract: contractAllocations,
                    library: libraryAllocations
                } = allocations[topicsCount].bySelector[selector]);
            }
            else {
                debug("no allocations for that selector!");
                contractAllocations = {};
                libraryAllocations = {};
            }
        }
        else {
            //if we don't have a selector, it means we don't have any non-anonymous events
            contractAllocations = {};
            libraryAllocations = {};
        }
        //now: let's get our allocations for anonymous events
        ({
            contract: contractAnonymousAllocations,
            library: libraryAnonymousAllocations
        } = allocations[topicsCount].anonymous);
    }
    else {
        //if there's not even an allocation for the topics count, we can't
        //decode; we could do this the honest way of setting all four allocation
        //objects to {}, but let's just short circuit
        debug("no allocations for that topic count!");
        return [];
    }
    //now: what contract are we (probably) dealing with? let's get its code to find out
    const codeBytes = yield {
        type: "code",
        address
    };
    const codeAsHex = Conversion.toHexString(codeBytes);
    const contractContext = Contexts.Utils.findContext(info.contexts, codeAsHex);
    let possibleContractAllocations; //excludes anonymous events
    let possibleContractAnonymousAllocations;
    let possibleExtraAllocations; //excludes anonymous events
    let possibleExtraAnonymousAllocations;
    const emittingContextHash = (contractContext || { context: undefined })
        .context;
    if (emittingContextHash) {
        //if we found the contract, maybe it's from that contract
        const contractAllocation = contractAllocations[emittingContextHash];
        const contractAnonymousAllocation = contractAnonymousAllocations[emittingContextHash];
        possibleContractAllocations = contractAllocation || [];
        possibleContractAnonymousAllocations = contractAnonymousAllocation || [];
        //also, we need to set up the extras (everything that's from a
        //non-library contract but *not* this one)
        possibleExtraAllocations = [].concat(...Object.entries(contractAllocations)
            .filter(([key, _]) => key !== emittingContextHash)
            .map(([_, value]) => value));
        possibleExtraAnonymousAllocations = [].concat(...Object.entries(contractAnonymousAllocations)
            .filter(([key, _]) => key !== emittingContextHash)
            .map(([_, value]) => value));
    }
    else {
        //if we couldn't determine the contract, well, we have to assume it's from a library
        debug("couldn't find context");
        possibleContractAllocations = [];
        possibleContractAnonymousAllocations = [];
        //or it's an extra, which could be any of the contracts
        possibleExtraAllocations = [].concat(...Object.values(contractAllocations));
        possibleExtraAnonymousAllocations = [].concat(...Object.values(contractAnonymousAllocations));
    }
    //now we get all the library allocations!
    const possibleLibraryAllocations = [].concat(...Object.values(libraryAllocations));
    const possibleLibraryAnonymousAllocations = [].concat(...Object.values(libraryAnonymousAllocations));
    //now we put it all together!
    const possibleAllocations = possibleContractAllocations.concat(possibleLibraryAllocations);
    const possibleAnonymousAllocations = possibleContractAnonymousAllocations.concat(possibleLibraryAnonymousAllocations);
    const possibleAllocationsTotalMinusExtras = possibleAllocations.concat(possibleAnonymousAllocations);
    //...and also there's the extras
    const possibleExtraAllocationsTotal = possibleExtraAllocations.concat(possibleExtraAnonymousAllocations);
    const possibleAllocationsTotal = possibleAllocationsTotalMinusExtras.concat([null], //HACK: add sentinel value before the extras
    possibleExtraAllocationsTotal);
    //whew!
    let decodings = [];
    allocationAttempts: for (const allocation of possibleAllocationsTotal) {
        debug("trying allocation: %O", allocation);
        //first: check for our sentinel value for extras (yeah, kind of HACKy)
        if (allocation === null) {
            switch (extras) {
                case "on":
                    continue allocationAttempts; //ignore the sentinel and continue
                case "off":
                    break allocationAttempts; //don't include extras; stop here
                case "necessary":
                    //stop on the sentinel and exclude extras *unless* there are no decodings yet
                    if (decodings.length > 0) {
                        break allocationAttempts;
                    }
                    else {
                        continue allocationAttempts;
                    }
            }
        }
        //second: do a name check so we can skip decoding if name is wrong
        //(this will likely be a more detailed check in the future)
        if (options.name !== undefined && allocation.abi.name !== options.name) {
            continue;
        }
        //now: the main part!
        let decodingMode = allocation.allocationMode; //starts out here; degrades to abi if necessary
        const contextHash = allocation.contextHash;
        const attemptContext = info.contexts[contextHash];
        const emittingContractType = Contexts.Import.contextToType(attemptContext);
        const contractType = allocation.definedIn;
        //you can't map with a generator, so we have to do this map manually
        let decodedArguments = [];
        for (const argumentAllocation of allocation.arguments) {
            let value;
            //if in full mode, use the allocation's listed data type.
            //if in ABI mode, abify it before use.
            let dataType = decodingMode === "full"
                ? argumentAllocation.type
                : abify_1.abifyType(argumentAllocation.type, info.userDefinedTypes);
            try {
                value = yield* decode_1.default(dataType, argumentAllocation.pointer, info, {
                    strictAbiMode: true,
                    allowRetry: decodingMode === "full" //this option is unnecessary but including for clarity
                });
            }
            catch (error) {
                if (error instanceof errors_1.StopDecodingError &&
                    error.allowRetry &&
                    decodingMode === "full") {
                    //if a retry happens, we've got to do several things in order to switch to ABI mode:
                    //1. mark that we're switching to ABI mode;
                    decodingMode = "abi";
                    //2. abify all previously decoded values;
                    decodedArguments = decodedArguments.map(argumentDecoding => (Object.assign(Object.assign({}, argumentDecoding), { value: abify_1.abifyResult(argumentDecoding.value, info.userDefinedTypes) })));
                    //3. retry this particular decode in ABI mode.
                    try {
                        value = yield* decode_1.default(abify_1.abifyType(argumentAllocation.type, info.userDefinedTypes), //type is now abified!
                        argumentAllocation.pointer, info, {
                            strictAbiMode: true //turns on STRICT MODE to cause more errors to be thrown
                            //retries no longer allowed, not that this has an effect
                        });
                    }
                    catch (_) {
                        //if an error occurred on the retry, this isn't a valid decoding!
                        debug("rejected due to exception on retry");
                        continue allocationAttempts;
                    }
                    //4. the remaining parameters will then automatically be decoded in ABI mode due to (1),
                    //so we don't need to do anything special there.
                }
                else {
                    //if any other sort of error occurred, this isn't a valid decoding!
                    debug("rejected due to exception on first try: %O", error);
                    continue allocationAttempts;
                }
            }
            const name = argumentAllocation.name;
            const indexed = argumentAllocation.pointer.location === "eventtopic";
            decodedArguments.push(name //deliberate general falsiness test
                ? { name, indexed, value }
                : { indexed, value });
        }
        //OK, so, having decoded the result, the question is: does it reencode to the original?
        //first, we have to filter out the indexed arguments, and also get rid of the name information
        const nonIndexedValues = decodedArguments
            .filter(argument => !argument.indexed)
            .map(argument => argument.value);
        //now, we can encode!
        const reEncodedData = AbiData.Encode.encodeTupleAbi(nonIndexedValues, info.allocations.abi);
        const encodedData = info.state.eventdata; //again, not great to read this directly, but oh well
        //are they equal?
        if (!Evm.Utils.equalData(reEncodedData, encodedData)) {
            //if not, this allocation doesn't work
            debug("rejected due to [non-indexed] mismatch");
            continue;
        }
        //one last check -- let's check that the indexed arguments match up, too
        const indexedValues = decodedArguments
            .filter(argument => argument.indexed)
            .map(argument => argument.value);
        const reEncodedTopics = indexedValues.map(Topic.Encode.encodeTopic);
        const encodedTopics = info.state.eventtopics;
        //now: do *these* match?
        const selectorAdjustment = allocation.anonymous ? 0 : 1;
        for (let i = 0; i < reEncodedTopics.length; i++) {
            if (!Evm.Utils.equalData(reEncodedTopics[i], encodedTopics[i + selectorAdjustment])) {
                debug("rejected due to indexed mismatch");
                continue allocationAttempts;
            }
        }
        //if we've made it here, the allocation works!  hooray!
        debug("allocation accepted!");
        let decoding;
        if (allocation.abi.anonymous) {
            decoding = {
                kind: "anonymous",
                definedIn: contractType,
                class: emittingContractType,
                abi: allocation.abi,
                arguments: decodedArguments,
                decodingMode
            };
        }
        else {
            decoding = {
                kind: "event",
                definedIn: contractType,
                class: emittingContractType,
                abi: allocation.abi,
                arguments: decodedArguments,
                selector,
                decodingMode
            };
        }
        decodings.push(decoding);
        //if we've made this far (so this allocation works), and we were passed an
        //ID, and it matches this ID, bail out & return this as the *only* decoding
        if (options.id && allocation.id === options.id) {
            return [decoding];
        }
    }
    return decodings;
}
exports.decodeEvent = decodeEvent;
const errorSelector = Conversion.toBytes(Web3Utils.soliditySha3({
    type: "string",
    value: "Error(string)"
})).subarray(0, Evm.Utils.SELECTOR_SIZE);
const panicSelector = Conversion.toBytes(Web3Utils.soliditySha3({
    type: "string",
    value: "Panic(uint256)"
})).subarray(0, Evm.Utils.SELECTOR_SIZE);
const defaultRevertAllocations = [
    {
        kind: "revert",
        allocationMode: "full",
        selector: errorSelector,
        abi: {
            name: "Error",
            type: "error",
            inputs: [
                {
                    name: "",
                    type: "string",
                    internalType: "string"
                }
            ]
        },
        definedIn: null,
        arguments: [
            {
                name: "",
                pointer: {
                    location: "returndata",
                    start: errorSelector.length,
                    length: Evm.Utils.WORD_SIZE
                },
                type: {
                    typeClass: "string",
                    typeHint: "string"
                }
            }
        ]
    },
    {
        kind: "revert",
        allocationMode: "full",
        selector: panicSelector,
        abi: {
            name: "Panic",
            type: "error",
            inputs: [
                {
                    name: "",
                    type: "uint256",
                    internalType: "uint256"
                }
            ]
        },
        definedIn: null,
        arguments: [
            {
                name: "",
                pointer: {
                    location: "returndata",
                    start: panicSelector.length,
                    length: Evm.Utils.WORD_SIZE
                },
                type: {
                    typeClass: "uint",
                    bits: Evm.Utils.WORD_SIZE * 8,
                    typeHint: "uint256"
                }
            }
        ]
    }
];
const defaultEmptyAllocations = [
    {
        kind: "failure",
        allocationMode: "full",
        selector: new Uint8Array(),
        arguments: []
    },
    {
        kind: "selfdestruct",
        allocationMode: "full",
        selector: new Uint8Array(),
        arguments: []
    }
];
/**
 * If there are multiple possibilities, they're always returned in
 * the order: return, revert, returnmessage, failure, empty, bytecode, unknownbytecode
 * Moreover, within "revert", builtin ones are put above custom ones
 * @Category Decoding
 */
function* decodeReturndata(info, successAllocation, //null here must be explicit
status, //you can pass this to indicate that you know the status,
id //useful when status = false
) {
    let possibleAllocations;
    const selector = Conversion.toHexString(info.state.returndata.slice(0, 4));
    const contextHash = (info.currentContext || { context: "" }).context; //HACK: "" is used to represent no context
    const customRevertAllocations = (((info.allocations.returndata || { [contextHash]: {} })[contextHash]) || { [selector]: [] })[selector] || [];
    if (successAllocation === null) {
        possibleAllocations = [
            ...defaultRevertAllocations,
            ...customRevertAllocations,
            ...defaultEmptyAllocations
        ];
    }
    else {
        switch (successAllocation.kind) {
            case "return":
                possibleAllocations = [
                    successAllocation,
                    ...defaultRevertAllocations,
                    ...customRevertAllocations,
                    ...defaultEmptyAllocations
                ];
                break;
            case "bytecode":
                possibleAllocations = [
                    ...defaultRevertAllocations,
                    ...customRevertAllocations,
                    ...defaultEmptyAllocations,
                    successAllocation
                ];
                break;
            case "returnmessage":
                possibleAllocations = [
                    ...defaultRevertAllocations,
                    ...customRevertAllocations,
                    successAllocation,
                    ...defaultEmptyAllocations
                ];
                break;
            //Other cases shouldn't happen so I'm leaving them to cause errors!
        }
    }
    let decodings = [];
    allocationAttempts: for (const allocation of possibleAllocations) {
        debug("trying allocation: %O", allocation);
        //before we attempt to use this allocation, we check: does the selector match?
        let encodedData = info.state.returndata; //again, not great to read this directly, but oh well
        const encodedPrefix = encodedData.subarray(0, allocation.selector.length);
        if (!Evm.Utils.equalData(encodedPrefix, allocation.selector)) {
            continue;
        }
        encodedData = encodedData.subarray(allocation.selector.length); //slice off the selector for later
        //also we check, does the status match?
        if (status !== undefined) {
            const successKinds = [
                "return",
                "selfdestruct",
                "bytecode",
                "returnmessage"
            ];
            const failKinds = ["failure", "revert"];
            if (status) {
                if (!successKinds.includes(allocation.kind)) {
                    continue;
                }
            }
            else {
                if (!failKinds.includes(allocation.kind)) {
                    continue;
                }
            }
        }
        if (allocation.kind === "bytecode") {
            //bytecode is special and can't really be integrated with the other cases.
            //so it gets its own function.
            const decoding = yield* decodeBytecode(info);
            if (decoding) {
                decodings.push(decoding);
            }
            continue;
        }
        if (allocation.kind === "returnmessage") {
            //this kind is also special, though thankfully it's easier
            const decoding = {
                kind: "returnmessage",
                status: true,
                data: Conversion.toHexString(info.state.returndata),
                decodingMode: allocation.allocationMode
            };
            decodings.push(decoding);
            continue;
        }
        let decodingMode = allocation.allocationMode; //starts out here; degrades to abi if necessary
        //you can't map with a generator, so we have to do this map manually
        let decodedArguments = [];
        for (const argumentAllocation of allocation.arguments) {
            let value;
            //if in full mode, use the allocation's listed data type.
            //if in ABI mode, abify it before use.
            let dataType = decodingMode === "full"
                ? argumentAllocation.type
                : abify_1.abifyType(argumentAllocation.type, info.userDefinedTypes);
            //now, let's decode!
            try {
                value = yield* decode_1.default(dataType, argumentAllocation.pointer, info, {
                    abiPointerBase: allocation.selector.length,
                    strictAbiMode: true,
                    allowRetry: decodingMode === "full" //this option is unnecessary but including for clarity
                });
                debug("value on first try: %O", value);
            }
            catch (error) {
                if (error instanceof errors_1.StopDecodingError &&
                    error.allowRetry &&
                    decodingMode === "full") {
                    debug("retry!");
                    //if a retry happens, we've got to do several things in order to switch to ABI mode:
                    //1. mark that we're switching to ABI mode;
                    decodingMode = "abi";
                    //2. abify all previously decoded values;
                    decodedArguments = decodedArguments.map(argumentDecoding => (Object.assign(Object.assign({}, argumentDecoding), { value: abify_1.abifyResult(argumentDecoding.value, info.userDefinedTypes) })));
                    //3. retry this particular decode in ABI mode.
                    try {
                        value = yield* decode_1.default(abify_1.abifyType(argumentAllocation.type, info.userDefinedTypes), //type is now abified!
                        argumentAllocation.pointer, info, {
                            abiPointerBase: allocation.selector.length,
                            strictAbiMode: true //turns on STRICT MODE to cause more errors to be thrown
                            //retries no longer allowed, not that this has an effect
                        });
                        debug("value on retry: %O", value);
                    }
                    catch (_) {
                        //if an error occurred on the retry, this isn't a valid decoding!
                        debug("rejected due to exception on retry");
                        continue allocationAttempts;
                    }
                    //4. the remaining parameters will then automatically be decoded in ABI mode due to (1),
                    //so we don't need to do anything special there.
                }
                else {
                    //if any other sort of error occurred, this isn't a valid decoding!
                    debug("rejected due to exception on first try: %O", error);
                    continue allocationAttempts;
                }
            }
            const name = argumentAllocation.name;
            decodedArguments.push(name //deliberate general falsiness test
                ? { name, value }
                : { value });
        }
        //OK, so, having decoded the result, the question is: does it reencode to the original?
        //first, we have to filter out the indexed arguments, and also get rid of the name information
        debug("decodedArguments: %O", decodedArguments);
        const decodedArgumentValues = decodedArguments.map(argument => argument.value);
        const reEncodedData = AbiData.Encode.encodeTupleAbi(decodedArgumentValues, info.allocations.abi);
        //are they equal? note the selector has been stripped off encodedData!
        if (!Evm.Utils.equalData(reEncodedData, encodedData)) {
            //if not, this allocation doesn't work
            debug("rejected due to mismatch");
            continue;
        }
        //if we've made it here, the allocation works!  hooray!
        debug("allocation accepted!");
        let decoding;
        switch (allocation.kind) {
            case "return":
                decoding = {
                    kind: "return",
                    status: true,
                    arguments: decodedArguments,
                    decodingMode
                };
                break;
            case "revert":
                decoding = {
                    kind: "revert",
                    abi: allocation.abi,
                    definedIn: allocation.definedIn,
                    status: false,
                    arguments: decodedArguments,
                    decodingMode
                };
                break;
            case "selfdestruct":
                decoding = {
                    kind: "selfdestruct",
                    status: true,
                    decodingMode
                };
                break;
            case "failure":
                decoding = {
                    kind: "failure",
                    status: false,
                    decodingMode
                };
                break;
        }
        decodings.push(decoding);
        //if we've made this far (so this allocation works), and we were passed an
        //ID, and it matches this ID, bail out & return this as the *only* decoding
        if (id && allocation.kind === "revert" && allocation.id === id) {
            return [decoding];
        }
    }
    return decodings;
}
exports.decodeReturndata = decodeReturndata;
//note: requires the bytecode to be in returndata, not code
function* decodeBytecode(info) {
    let decodingMode = "full"; //as always, degrade as necessary
    const bytecode = Conversion.toHexString(info.state.returndata);
    const context = Contexts.Utils.findContext(info.contexts, bytecode);
    if (!context) {
        return {
            kind: "unknownbytecode",
            status: true,
            decodingMode: "full",
            bytecode
        };
    }
    const contractType = Contexts.Import.contextToType(context);
    //now: ignore original allocation (which we didn't even pass :) )
    //and lookup allocation by context
    const allocation = info.allocations.calldata.constructorAllocations[context.context].output;
    debug("bytecode allocation: %O", allocation);
    //now: add immutables if applicable
    let immutables;
    if (allocation.immutables) {
        immutables = [];
        //NOTE: if we're in here, we can assume decodingMode === "full"
        for (const variable of allocation.immutables) {
            const dataType = variable.type; //we don't conditioning on decodingMode here because we know it
            let value;
            try {
                value = yield* decode_1.default(dataType, variable.pointer, info, {
                    allowRetry: true,
                    strictAbiMode: true,
                    paddingMode: "defaultOrZero"
                });
            }
            catch (error) {
                if (error instanceof errors_1.StopDecodingError && error.allowRetry) {
                    //we "retry" by... not bothering with immutables :P
                    //(but we do set the mode to ABI)
                    decodingMode = "abi";
                    immutables = undefined;
                    break;
                }
                else {
                    //otherwise, this isn't a valid decoding I guess
                    return null;
                }
            }
            immutables.push({
                name: variable.name,
                class: variable.definedIn,
                value
            });
        }
    }
    let decoding = {
        kind: "bytecode",
        status: true,
        decodingMode,
        bytecode,
        immutables,
        class: contractType
    };
    //finally: add address if applicable
    if (allocation.delegatecallGuard) {
        decoding.address = Web3Utils.toChecksumAddress(bytecode.slice(4, 4 + 2 * Evm.Utils.ADDRESS_SIZE) //4 = "0x73".length
        );
    }
    return decoding;
}
/**
 * Decodes the return data from a failed call.
 *
 * @param returndata The returned data, as a Uint8Array.
 * @return An array of possible decodings.  At the moment it's
 *   impossible for there to be more than one.  (If the call didn't actually
 *   fail, or failed in a nonstandard way, you may get no decodings at all, though!)
 *
 *   Decodings can either be decodings of revert messages, or decodings
 *   indicating that there was no revert message.  If somehow both were to be
 *   possible, they'd go in that order, although as mentioned, there (at least
 *   currently) isn't any way for that to occur.
 * @Category Decoding convenience
 */
function decodeRevert(returndata) {
    //coercing because TS doesn't know it'll finish in one go
    return decodeReturndata({
        allocations: {},
        state: {
            storage: {},
            returndata
        }
    }, null, false).next().value;
}
exports.decodeRevert = decodeRevert;
//# sourceMappingURL=core.js.map