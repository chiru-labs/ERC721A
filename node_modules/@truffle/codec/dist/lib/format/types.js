"use strict";
/**
 * Contains the types for type objects, and some
 * functions for working with them.
 *
 * @category Main Format
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isContractDefinedType = exports.typeStringWithoutLocation = exports.typeString = exports.specifyLocation = exports.fullType = exports.isReferenceType = exports.forgetCompilations = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:format:types");
function forgetCompilations(typesByCompilation) {
    return Object.assign({}, ...Object.values(typesByCompilation).map(({ types }) => types));
}
exports.forgetCompilations = forgetCompilations;
function isUserDefinedType(anyType) {
    const userDefinedTypes = ["contract", "enum", "struct", "userDefinedValueType"];
    return userDefinedTypes.includes(anyType.typeClass);
}
function isReferenceType(anyType) {
    const alwaysReferenceTypes = ["array", "mapping", "struct", "string"];
    if (alwaysReferenceTypes.includes(anyType.typeClass)) {
        return true;
    }
    else if (anyType.typeClass === "bytes") {
        return anyType.kind === "dynamic";
    }
    else {
        return false;
    }
}
exports.isReferenceType = isReferenceType;
//one could define a counterpart function that stripped all unnecessary information
//from the type object, but at the moment I see no need for that
function fullType(basicType, userDefinedTypes) {
    if (!isUserDefinedType(basicType)) {
        return basicType;
    }
    let id = basicType.id;
    let storedType = userDefinedTypes[id];
    if (!storedType) {
        return basicType;
    }
    let returnType = Object.assign(Object.assign({}, basicType), storedType);
    if (isReferenceType(basicType) && basicType.location !== undefined) {
        returnType = specifyLocation(returnType, basicType.location);
    }
    return returnType;
}
exports.fullType = fullType;
//the location argument here always forces, so passing undefined *will* force undefined
function specifyLocation(dataType, location) {
    if (isReferenceType(dataType)) {
        switch (dataType.typeClass) {
            case "string":
            case "bytes":
                return Object.assign(Object.assign({}, dataType), { location });
            case "array":
                return Object.assign(Object.assign({}, dataType), { location, baseType: specifyLocation(dataType.baseType, location) });
            case "mapping":
                let newLocation = location === "storage" ? "storage" : undefined;
                return Object.assign(Object.assign({}, dataType), { location: newLocation, valueType: specifyLocation(dataType.valueType, newLocation) });
            case "struct":
                let returnType = Object.assign(Object.assign({}, dataType), { location });
                if (returnType.memberTypes) {
                    returnType.memberTypes = returnType.memberTypes.map(({ name: memberName, type: memberType }) => ({
                        name: memberName,
                        type: specifyLocation(memberType, location)
                    }));
                }
                return returnType;
        }
    }
    else {
        return dataType;
    }
}
exports.specifyLocation = specifyLocation;
//NOTE: the following two functions might not be exactly right for weird internal stuff,
//or for ABI-only stuff.  (E.g. for internal stuff sometimes it records whether things
//are pointers or not??  we don't track that so we can't recreate that)
//But what can you do.
function typeString(dataType) {
    let baseString = typeStringWithoutLocation(dataType);
    if (isReferenceType(dataType) && dataType.location) {
        return baseString + " " + dataType.location;
    }
    else {
        return baseString;
    }
}
exports.typeString = typeString;
function typeStringWithoutLocation(dataType) {
    switch (dataType.typeClass) {
        case "uint":
            return dataType.typeHint || `uint${dataType.bits}`;
        case "int":
            return dataType.typeHint || `int${dataType.bits}`;
        case "bool":
            return dataType.typeHint || "bool";
        case "bytes":
            if (dataType.typeHint) {
                return dataType.typeHint;
            }
            switch (dataType.kind) {
                case "dynamic":
                    return "bytes";
                case "static":
                    return `bytes${dataType.length}`;
            }
        case "address":
            switch (dataType.kind) {
                case "general":
                    return dataType.typeHint || "address"; //I guess?
                case "specific":
                    return dataType.payable ? "address payable" : "address";
            }
        case "string":
            return dataType.typeHint || "string";
        case "fixed":
            return dataType.typeHint || `fixed${dataType.bits}x${dataType.places}`;
        case "ufixed":
            return dataType.typeHint || `ufixed${dataType.bits}x${dataType.places}`;
        case "array":
            if (dataType.typeHint) {
                return dataType.typeHint;
            }
            switch (dataType.kind) {
                case "dynamic":
                    return `${typeStringWithoutLocation(dataType.baseType)}[]`;
                case "static":
                    return `${typeStringWithoutLocation(dataType.baseType)}[${dataType.length}]`;
            }
        case "mapping":
            return `mapping(${typeStringWithoutLocation(dataType.keyType)} => ${typeStringWithoutLocation(dataType.valueType)})`;
        case "struct":
        case "enum":
            //combining these cases for simplicity
            switch (dataType.kind) {
                case "local":
                    return `${dataType.typeClass} ${dataType.definingContractName}.${dataType.typeName}`;
                case "global":
                    return `${dataType.typeClass} ${dataType.typeName}`;
            }
            break; //to satisfy TS :P
        case "userDefinedValueType":
            //differs from struct & enum in that typeClass is omitted
            switch (dataType.kind) {
                case "local":
                    return `${dataType.definingContractName}.${dataType.typeName}`;
                case "global":
                    return `${dataType.typeName}`;
            }
            break; //to satisfy TS :P
        case "tuple":
            return (dataType.typeHint ||
                "tuple(" +
                    dataType.memberTypes
                        .map(memberType => typeString(memberType.type))
                        .join(",") +
                    ")"); //note that we do include location and do not put spaces
        case "contract":
            return dataType.contractKind + " " + dataType.typeName;
        case "magic":
            //no, this is not transposed!
            const variableNames = {
                message: "msg",
                transaction: "tx",
                block: "block"
            };
            return variableNames[dataType.variable];
        case "type":
            return `type(${typeString(dataType.type)})`;
        case "function":
            let visibilityString;
            switch (dataType.visibility) {
                case "external":
                    if (dataType.kind === "general") {
                        if (dataType.typeHint) {
                            return dataType.typeHint;
                        }
                        else {
                            return "function external"; //I guess???
                        }
                    }
                    visibilityString = " external"; //note the deliberate space!
                    break;
                case "internal":
                    visibilityString = "";
                    break;
            }
            let mutabilityString = dataType.mutability === "nonpayable" ? "" : " " + dataType.mutability; //again, note the deliberate space
            let inputList = dataType.inputParameterTypes.map(typeString).join(","); //note that we do include location, and do not put spaces
            let outputList = dataType.outputParameterTypes.map(typeString).join(",");
            let inputString = `function(${inputList})`;
            let outputString = outputList === "" ? "" : ` returns (${outputList})`; //again, note the deliberate space
            return inputString + mutabilityString + visibilityString + outputString;
    }
}
exports.typeStringWithoutLocation = typeStringWithoutLocation;
function isContractDefinedType(anyType) {
    const contractDefinedTypes = ["enum", "struct", "userDefinedValueType"];
    return contractDefinedTypes.includes(anyType.typeClass)
        && anyType.kind === "local";
}
exports.isContractDefinedType = isContractDefinedType;
//# sourceMappingURL=types.js.map