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
exports.getterParameters = exports.definitionToAbi = exports.isContractPayable = exports.mutability = exports.functionClass = exports.functionKind = exports.parameters = exports.valueDefinition = exports.keyDefinition = exports.baseDefinition = exports.rationalValue = exports.regularizeTypeIdentifier = exports.spliceLocation = exports.isSimpleConstant = exports.stackSize = exports.contractKind = exports.referenceType = exports.isReference = exports.isEnum = exports.isMapping = exports.isStruct = exports.staticLengthAsString = exports.staticLength = exports.isDynamicArray = exports.isArray = exports.decimalPlaces = exports.specifiedSize = exports.visibility = exports.typeId = exports.typeClassLongForm = exports.typeClass = exports.typeStringWithoutLocation = exports.typeString = exports.typeIdentifier = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:ast:utils");
const Common = __importStar(require("../common"));
const bn_js_1 = __importDefault(require("bn.js"));
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
/** @category Definition Reading */
function typeIdentifier(definition) {
    return definition.typeDescriptions.typeIdentifier;
}
exports.typeIdentifier = typeIdentifier;
/** @category Definition Reading */
function typeString(definition) {
    return definition.typeDescriptions.typeString;
}
exports.typeString = typeString;
/**
 * Returns the type string, but with location (if any) stripped off the end
 * @category Definition Reading
 */
function typeStringWithoutLocation(definition) {
    if (definition.nodeType === "YulTypedName") {
        //for handling Yul variables
        return "bytes32";
    }
    return typeString(definition).replace(/ (storage|memory|calldata)( slice)?$/, "");
}
exports.typeStringWithoutLocation = typeStringWithoutLocation;
/**
 * returns basic type class for a variable definition node
 * e.g.:
 *  `t_uint256` becomes `uint`
 *  `t_struct$_Thing_$20_memory_ptr` becomes `struct`
 * @category Definition Reading
 */
function typeClass(definition) {
    if (definition.nodeType === "YulTypedName") {
        //for handling Yul variables
        return "bytes";
    }
    return typeIdentifier(definition).match(/t_([^$_0-9]+)/)[1];
}
exports.typeClass = typeClass;
/**
 * similar to typeClass, but includes any numeric qualifiers
 * e.g.:
 * `t_uint256` becomes `uint256`
 * @category Definition Reading
 */
function typeClassLongForm(definition) {
    return typeIdentifier(definition).match(/t_([^$_]+)/)[1];
}
exports.typeClassLongForm = typeClassLongForm;
/**
 * for user-defined types -- structs, enums, contracts
 * often you can get these from referencedDeclaration, but not
 * always
 * @category Definition Reading
 */
function typeId(definition) {
    debug("definition %O", definition);
    return parseInt(typeIdentifier(definition).match(/\$(\d+)(_(storage|memory|calldata)(_ptr(_slice)?)?)?$/)[1]);
}
exports.typeId = typeId;
/**
 * For function types; returns internal or external
 * (not for use on other types! will cause an error!)
 * should only return "internal" or "external"
 * @category Definition Reading
 */
function visibility(definition) {
    return ((definition.typeName
        ? definition.typeName.visibility
        : definition.visibility));
}
exports.visibility = visibility;
/**
 * e.g. uint48 -> 6
 * @return size in bytes for explicit type size, or `null` if not stated
 * @category Definition Reading
 */
function specifiedSize(definition) {
    if (definition.nodeType === "YulTypedName") {
        return 32; //for handling Yul variables
    }
    let specified = typeIdentifier(definition).match(/t_[a-z]+([0-9]+)/);
    if (!specified) {
        return null;
    }
    let num = parseInt(specified[1]);
    switch (typeClass(definition)) {
        case "int":
        case "uint":
        case "fixed":
        case "ufixed":
            return num / 8;
        case "bytes":
            return num;
        default:
            debug("Unknown type for size specification: %s", typeIdentifier(definition));
    }
}
exports.specifiedSize = specifiedSize;
/**
 * for fixed-point types, obviously
 * @category Definition Reading
 */
function decimalPlaces(definition) {
    return parseInt(typeIdentifier(definition).match(/t_[a-z]+[0-9]+x([0-9]+)/)[1]);
}
exports.decimalPlaces = decimalPlaces;
/** @category Definition Reading */
function isArray(definition) {
    return typeIdentifier(definition).match(/^t_array/) != null;
}
exports.isArray = isArray;
/** @category Definition Reading */
function isDynamicArray(definition) {
    return (isArray(definition) &&
        //NOTE: we do this by parsing the type identifier, rather than by just
        //checking the length field, because we might be using this on a faked-up
        //definition
        typeIdentifier(definition).match(/\$dyn_(storage|memory|calldata)(_ptr(_slice)?)?$/) != null);
}
exports.isDynamicArray = isDynamicArray;
/**
 * length of a statically sized array -- please only use for arrays
 * already verified to be static!
 * @category Definition Reading
 */
function staticLength(definition) {
    //NOTE: we do this by parsing the type identifier, rather than by just
    //checking the length field, because we might be using this on a faked-up
    //definition
    return parseInt(staticLengthAsString(definition));
}
exports.staticLength = staticLength;
/**
 * see staticLength for explanation
 * @category Definition Reading
 */
function staticLengthAsString(definition) {
    return typeIdentifier(definition).match(/\$(\d+)_(storage|memory|calldata)(_ptr(_slice)?)?$/)[1];
}
exports.staticLengthAsString = staticLengthAsString;
/** @category Definition Reading */
function isStruct(definition) {
    return typeIdentifier(definition).match(/^t_struct/) != null;
}
exports.isStruct = isStruct;
/** @category Definition Reading */
function isMapping(definition) {
    return typeIdentifier(definition).match(/^t_mapping/) != null;
}
exports.isMapping = isMapping;
/** @category Definition Reading */
function isEnum(definition) {
    return typeIdentifier(definition).match(/^t_enum/) != null;
}
exports.isEnum = isEnum;
/** @category Definition Reading */
function isReference(definition) {
    return (typeIdentifier(definition).match(/_(memory|storage|calldata)(_ptr(_slice)?)?$/) != null);
}
exports.isReference = isReference;
/**
 * note: only use this on things already verified to be references
 * @category Definition Reading
 */
function referenceType(definition) {
    return typeIdentifier(definition).match(/_([^_]+)(_ptr(_slice)?)?$/)[1];
}
exports.referenceType = referenceType;
/**
 * only for contract types, obviously! will yield nonsense otherwise!
 * @category Definition Reading
 */
function contractKind(definition) {
    return typeString(definition).split(" ")[0];
}
exports.contractKind = contractKind;
/**
 * stack size, in words, of a given type
 * note: this function assumes that UDVTs only ever take up
 * a single word, which is currently true
 * @category Definition Reading
 */
function stackSize(definition) {
    if (typeClass(definition) === "function" &&
        visibility(definition) === "external") {
        return 2;
    }
    if (isReference(definition) && referenceType(definition) === "calldata") {
        if (typeClass(definition) === "string" ||
            typeClass(definition) === "bytes") {
            return 2;
        }
        if (isDynamicArray(definition)) {
            return 2;
        }
    }
    return 1;
}
exports.stackSize = stackSize;
/** @category Definition Reading */
function isSimpleConstant(definition) {
    const types = ["stringliteral", "rational"];
    return types.includes(typeClass(definition));
}
exports.isSimpleConstant = isSimpleConstant;
/**
 * definition: a storage reference definition
 * location: the location you want it to refer to instead
 * @category Definition Reading
 */
function spliceLocation(definition, location) {
    debug("definition %O", definition);
    return Object.assign(Object.assign({}, definition), { typeDescriptions: Object.assign(Object.assign({}, definition.typeDescriptions), { typeIdentifier: definition.typeDescriptions.typeIdentifier.replace(/_(storage|memory|calldata)(?=((_slice)?_ptr)?$)/, "_" + location) }) });
}
exports.spliceLocation = spliceLocation;
/**
 * adds "_ptr" on to the end of type identifiers that might need it; note that
 * this operates on identifiers, not definitions
 * @category Definition Reading
 */
function regularizeTypeIdentifier(identifier) {
    return identifier.replace(/(_(storage|memory|calldata))((_slice)?_ptr)?$/, "$1_ptr" //this used to use lookbehind for clarity, but Firefox...
    //(see: https://github.com/trufflesuite/truffle/issues/3068 )
    );
}
exports.regularizeTypeIdentifier = regularizeTypeIdentifier;
/**
 * extract the actual numerical value from a node of type rational.
 * currently assumes result will be integer (currently returns BN)
 * @category Definition Reading
 */
function rationalValue(definition) {
    let identifier = typeIdentifier(definition);
    let absoluteValue = identifier.match(/_(\d+)_by_1$/)[1];
    let isNegative = identifier.match(/_minus_/) != null;
    return isNegative ? new bn_js_1.default(absoluteValue).neg() : new bn_js_1.default(absoluteValue);
}
exports.rationalValue = rationalValue;
/** @category Definition Reading */
function baseDefinition(definition) {
    if (definition.typeName && definition.typeName.baseType) {
        return definition.typeName.baseType;
    }
    if (definition.baseType) {
        return definition.baseType;
    }
    //otherwise, we'll have to spoof it up ourselves
    let baseIdentifier = typeIdentifier(definition).match(/^t_array\$_(.*)_\$/)[1];
    //greedy match to extract everything from first to last dollar sign
    // HACK - internal types for memory or storage also seem to be pointers
    baseIdentifier = regularizeTypeIdentifier(baseIdentifier);
    // another HACK - we get away with it because we're only using that one property
    let result = lodash_clonedeep_1.default(definition);
    result.typeDescriptions.typeIdentifier = baseIdentifier;
    return result;
    //WARNING -- these hacks do *not* correctly handle all cases!
    //they do, however, handle the cases we currently need.
}
exports.baseDefinition = baseDefinition;
/**
 * for use for mappings and arrays only!
 * for arrays, fakes up a uint definition
 * @category Definition Reading
 */
function keyDefinition(definition, scopes) {
    let result;
    switch (typeClass(definition)) {
        case "mapping":
            //first: is there a key type already there? if so just use that
            if (definition.keyType) {
                return definition.keyType;
            }
            if (definition.typeName && definition.typeName.keyType) {
                return definition.typeName.keyType;
            }
            //otherwise: is there a referencedDeclaration? if so try using that
            let baseDeclarationId = definition.referencedDeclaration;
            debug("baseDeclarationId %d", baseDeclarationId);
            //if there's a referencedDeclaration, we'll use that
            if (baseDeclarationId !== undefined) {
                let baseDeclaration = scopes[baseDeclarationId].definition;
                return baseDeclaration.keyType || baseDeclaration.typeName.keyType;
            }
            //otherwise, we'll need to perform some hackery, similarly to in baseDefinition;
            //we'll have to spoof it up ourselves
            let keyIdentifier = typeIdentifier(definition).match(/^t_mapping\$_(.*?)_\$_/)[1];
            //use *non*-greedy match; note that if the key type could include
            //the sequence "_$_", this could cause a problem, but they can't; the only
            //valid key types that include dollar signs at all are user-defined types,
            //which contain both "$_" and "_$" but never "_$_".
            // HACK - internal types for memory or storage also seem to be pointers
            keyIdentifier = regularizeTypeIdentifier(keyIdentifier);
            let keyString = typeString(definition).match(/mapping\((.*?) => .*\)( storage)?$/)[1];
            //use *non*-greedy match; note that if the key type could include
            //"=>", this could cause a problem, but mappings are not allowed as key
            //types, so this can't come up
            // another HACK - we get away with it because we're only using that one property
            result = lodash_clonedeep_1.default(definition);
            result.typeDescriptions = {
                typeIdentifier: keyIdentifier,
                typeString: keyString
            };
            return result;
        case "array":
            //HACK -- again we should get away with it because for a uint256 we don't
            //really need to inspect the other properties
            result = lodash_clonedeep_1.default(definition);
            result.typeDescriptions = {
                typeIdentifier: "t_uint256",
                typeString: "uint256"
            };
            return result;
        default:
            debug("unrecognized index access!");
    }
}
exports.keyDefinition = keyDefinition;
/**
 * for use for mappings only!
 * @category Definition Reading
 */
function valueDefinition(definition, scopes) {
    let result;
    //first: is there a value type already there? if so just use that
    if (definition.valueType) {
        return definition.valueType;
    }
    if (definition.typeName && definition.typeName.valueType) {
        return definition.typeName.valueType;
    }
    //otherwise: is there a referencedDeclaration? if so try using that
    let baseDeclarationId = definition.referencedDeclaration;
    debug("baseDeclarationId %d", baseDeclarationId);
    //if there's a referencedDeclaration, we'll use that
    if (baseDeclarationId !== undefined) {
        let baseDeclaration = scopes[baseDeclarationId].definition;
        return baseDeclaration.valueType || baseDeclaration.typeName.valueType;
    }
    //otherwise, we'll need to perform some hackery, similarly to in keyDefinition;
    //we'll have to spoof it up ourselves
    let valueIdentifier = typeIdentifier(definition).match(/^t_mapping\$_.*?_\$_(.*)_\$/)[1];
    //use *non*-greedy match on the key; note that if the key type could include
    //the sequence "_$_", this could cause a problem, but they can't; the only
    //valid key types that include dollar signs at all are user-defined types,
    //which contain both "$_" and "_$" but never "_$_".
    // HACK - internal types for memory or storage also seem to be pointers
    valueIdentifier = regularizeTypeIdentifier(valueIdentifier);
    let valueString = typeString(definition).match(/mapping\(.*? => (.*)\)( storage)?$/)[1];
    //use *non*-greedy match; note that if the key type could include
    //"=>", this could cause a problem, but mappings are not allowed as key
    //types, so this can't come up
    // another HACK - we get away with it because we're only using that one property
    result = lodash_clonedeep_1.default(definition);
    result.typeDescriptions = {
        typeIdentifier: valueIdentifier,
        typeString: valueString
    };
    return result;
}
exports.valueDefinition = valueDefinition;
/**
 * returns input parameters, then output parameters
 * NOTE: ONLY FOR VARIABLE DECLARATIONS OF FUNCTION TYPE
 * NOT FOR FUNCTION DEFINITIONS
 * @category Definition Reading
 */
function parameters(definition) {
    let typeObject = definition.typeName || definition;
    if (typeObject.parameterTypes && typeObject.returnParameterTypes) {
        return [
            typeObject.parameterTypes.parameters,
            typeObject.returnParameterTypes.parameters
        ];
    }
    else {
        return undefined;
    }
}
exports.parameters = parameters;
/**
 * compatibility function, since pre-0.5.0 functions don't have node.kind
 * returns undefined if you don't put in a function node
 * @category Definition Reading
 */
function functionKind(node) {
    if (node.nodeType !== "FunctionDefinition") {
        return undefined;
    }
    if (node.kind !== undefined) {
        //if we're dealing with 0.5.x, we can just read node.kind
        return node.kind;
    }
    //otherwise, we need this little shim
    if (node.isConstructor) {
        return "constructor";
    }
    return node.name === "" ? "fallback" : "function";
}
exports.functionKind = functionKind;
//this is kind of a weird one, it exposes some Solidity internals.
//for internal functions it'll return "internal".
//for external functions it'll return "external".
//for library functions it'll return "delegatecall".
//and for builtin functions, it'll return an internal name for
//that particular builtin function.
//(there are more possibilities but I'm not going to list them all here)
function functionClass(node) {
    const match = typeIdentifier(node).match(/^t_function_([^_]+)_/);
    return match ? match[1] : undefined;
}
exports.functionClass = functionClass;
/**
 * similar compatibility function for mutability for pre-0.4.16 versions
 * returns undefined if you don't give it a FunctionDefinition or
 * VariableDeclaration
 * @category Definition Reading
 */
function mutability(node) {
    node = node.typeName || node;
    if (node.nodeType !== "FunctionDefinition" &&
        node.nodeType !== "FunctionTypeName") {
        return undefined;
    }
    if (node.stateMutability !== undefined) {
        //if we're dealing with 0.4.16 or later, we can just read node.stateMutability
        return node.stateMutability;
    }
    //otherwise, we need this little shim
    if (node.payable) {
        return "payable";
    }
    if (node.constant) {
        //yes, it means "view" even if you're looking at a variable declaration!
        //old Solidity was weird!
        return "view";
    }
    return "nonpayable";
}
exports.mutability = mutability;
/**
 * takes a contract definition and asks, does it have a payable fallback
 * function?
 * @category Definition Reading
 */
function isContractPayable(definition) {
    return definition.nodes.some(node => node.nodeType === "FunctionDefinition" &&
        (functionKind(node) === "fallback" || functionKind(node) === "receive") &&
        mutability(node) === "payable");
}
exports.isContractPayable = isContractPayable;
/**
 * the main function. just does some dispatch.
 * returns undefined on bad input
 */
function definitionToAbi(node, referenceDeclarations) {
    switch (node.nodeType) {
        case "FunctionDefinition":
            if (node.visibility === "public" || node.visibility === "external") {
                return functionDefinitionToAbi(node, referenceDeclarations);
            }
            else {
                return undefined;
            }
        case "EventDefinition":
            return eventDefinitionToAbi(node, referenceDeclarations);
        case "ErrorDefinition":
            return errorDefinitionToAbi(node, referenceDeclarations);
        case "VariableDeclaration":
            if (node.visibility === "public") {
                return getterDefinitionToAbi(node, referenceDeclarations);
            }
            else {
                return undefined;
            }
        default:
            return undefined;
    }
}
exports.definitionToAbi = definitionToAbi;
//note: not for FunctionTypeNames or VariableDeclarations
function functionDefinitionToAbi(node, referenceDeclarations) {
    let kind = functionKind(node);
    let stateMutability = mutability(node);
    let payable = stateMutability === "payable";
    let inputs;
    switch (kind) {
        case "function":
            let name = node.name;
            let outputs = parametersToAbi(node.returnParameters.parameters, referenceDeclarations);
            inputs = parametersToAbi(node.parameters.parameters, referenceDeclarations);
            return {
                type: "function",
                name,
                inputs,
                outputs,
                stateMutability
            };
        case "constructor":
            inputs = parametersToAbi(node.parameters.parameters, referenceDeclarations);
            //note: need to coerce because of mutability restrictions
            return {
                type: "constructor",
                inputs,
                stateMutability,
                payable
            };
        case "fallback":
            //note: need to coerce because of mutability restrictions
            return {
                type: "fallback",
                stateMutability,
                payable
            };
        case "receive":
            //note: need to coerce because of mutability restrictions
            return {
                type: "receive",
                stateMutability,
                payable
            };
    }
}
function eventDefinitionToAbi(node, referenceDeclarations) {
    let inputs = parametersToAbi(node.parameters.parameters, referenceDeclarations);
    let name = node.name;
    let anonymous = node.anonymous;
    return {
        type: "event",
        inputs,
        name,
        anonymous
    };
}
function errorDefinitionToAbi(node, referenceDeclarations) {
    let inputs = parametersToAbi(node.parameters.parameters, referenceDeclarations);
    let name = node.name;
    return {
        type: "error",
        inputs,
        name
    };
}
function parametersToAbi(nodes, referenceDeclarations) {
    return nodes.map(node => parameterToAbi(node, referenceDeclarations));
}
//NOTE: This function is only for types that could potentially go in the ABI!
//(otherwise it could, say, loop infinitely)
//currently it will only ever be called on those because it's only called from
//definitionToAbi, which filters out any definitions that are not for
//this that *actually* go in the ABI
//if you want to expand it to handle those (by throwing an exception, say),
//you'll need to give it a way to detect circularities
function parameterToAbi(node, referenceDeclarations) {
    let name = node.name; //may be the empty string... or even undefined for a base type
    let components;
    let internalType = typeStringWithoutLocation(node);
    //is this an array? if so use separate logic
    if (typeClass(node) === "array") {
        let baseType = node.typeName ? node.typeName.baseType : node.baseType;
        let baseAbi = parameterToAbi(baseType, referenceDeclarations);
        let arraySuffix = isDynamicArray(node) ? `[]` : `[${staticLength(node)}]`;
        const parameter = {
            name,
            type: baseAbi.type + arraySuffix,
            components: baseAbi.components,
            internalType
        };
        if ("indexed" in node) {
            return Object.assign(Object.assign({}, parameter), { indexed: node.indexed });
        }
        else {
            return parameter;
        }
    }
    let abiTypeString = toAbiType(node, referenceDeclarations);
    //otherwise... is it a struct? if so we need to populate components
    if (typeClass(node) === "struct") {
        let id = typeId(node);
        let referenceDeclaration = referenceDeclarations[id];
        if (referenceDeclaration === undefined) {
            let typeToDisplay = typeString(node);
            throw new Common.UnknownUserDefinedTypeError(id.toString(), typeToDisplay);
        }
        components = parametersToAbi(referenceDeclaration.members, referenceDeclarations);
    }
    const parameter = {
        name,
        type: abiTypeString,
        components,
        internalType
    };
    if ("indexed" in node) {
        return Object.assign(Object.assign({}, parameter), { indexed: node.indexed });
    }
    else {
        return parameter;
    }
}
//note: this is only meant for non-array types that can go in the ABI
//it returns how that type is notated in the ABI -- just the string,
//to be clear, not components of tuples
//again, NOT FOR ARRAYS
function toAbiType(node, referenceDeclarations) {
    let basicType = typeClassLongForm(node); //get that whole first segment!
    switch (basicType) {
        case "contract":
            return "address";
        case "struct":
            return "tuple"; //the more detailed checking will be handled elsewhere
        case "enum": {
            const referenceId = typeId(node);
            const referenceDeclaration = referenceDeclarations[referenceId];
            if (referenceDeclaration === undefined) {
                const typeToDisplay = typeString(node);
                throw new Common.UnknownUserDefinedTypeError(referenceId.toString(), typeToDisplay);
            }
            const numOptions = referenceDeclaration.members.length;
            const bits = 8 * Math.ceil(Math.log2(numOptions) / 8);
            return `uint${bits}`;
        }
        case "userDefinedValueType": {
            const referenceId = typeId(node);
            const referenceDeclaration = referenceDeclarations[referenceId];
            if (referenceDeclaration === undefined) {
                const typeToDisplay = typeString(node);
                throw new Common.UnknownUserDefinedTypeError(referenceId.toString(), typeToDisplay);
            }
            const underlyingType = referenceDeclaration.underlyingType;
            return toAbiType(underlyingType, referenceDeclarations);
        }
        default:
            return basicType;
        //note that: int/uint/fixed/ufixed/bytes will have their size and such left on;
        //address will have "payable" left off;
        //external functions will be reduced to "function" (and internal functions shouldn't
        //be passed in!)
        //(mappings shouldn't be passed in either obviously)
        //(nor arrays :P )
    }
}
function getterDefinitionToAbi(node, referenceDeclarations) {
    debug("getter node: %O", node);
    let name = node.name;
    let { inputs, outputs } = getterParameters(node, referenceDeclarations);
    let inputsAbi = parametersToAbi(inputs, referenceDeclarations);
    let outputsAbi = parametersToAbi(outputs, referenceDeclarations);
    return {
        type: "function",
        name,
        inputs: inputsAbi,
        outputs: outputsAbi,
        stateMutability: "view"
    };
}
//how getter parameters work:
//INPUT:
//types other than arrays and mappings take no input.
//array getters take uint256 input. mapping getters take input of their key type.
//if arrays, mappings, stacked, then takes multiple inputs, in order from outside
//to in.
//These parameters are unnamed.
//OUTPUT:
//if base type (beneath mappings & arrays) is not a struct, returns that.
//(This return parameter has no name -- it is *not* named for the variable!)
//if it is a struct, returns multiple outputs, one for each member of the struct,
//*except* arrays and mappings.  (And they have names, the names of the members.)
//important note: inner structs within a struct are just returned, not
//partially destructured like the outermost struct!  Yes, this is confusing.
function getterParameters(node, referenceDeclarations) {
    let baseNode = node.typeName || node;
    let inputs = [];
    while (typeClass(baseNode) === "array" || typeClass(baseNode) === "mapping") {
        let keyNode = keyDefinition(baseNode); //note: if baseNode is an array, this spoofs up a uint256 definition
        inputs.push(Object.assign(Object.assign({}, keyNode), { name: "" })); //again, getter input params have no name
        switch (typeClass(baseNode)) {
            case "array":
                baseNode = baseNode.baseType;
                break;
            case "mapping":
                baseNode = baseNode.valueType;
                break;
        }
    }
    //at this point, baseNode should hold the base type
    //now we face the question: is it a struct?
    if (typeClass(baseNode) === "struct") {
        let id = typeId(baseNode);
        let referenceDeclaration = referenceDeclarations[id];
        if (referenceDeclaration === undefined) {
            let typeToDisplay = typeString(baseNode);
            throw new Common.UnknownUserDefinedTypeError(id.toString(), typeToDisplay);
        }
        let outputs = referenceDeclaration.members.filter(member => typeClass(member) !== "array" && typeClass(member) !== "mapping");
        return { inputs, outputs }; //no need to wash name!
    }
    else {
        //only one output; it's just the base node, with its name washed
        return { inputs, outputs: [Object.assign(Object.assign({}, baseNode), { name: "" })] };
    }
}
exports.getterParameters = getterParameters;
//# sourceMappingURL=utils.js.map