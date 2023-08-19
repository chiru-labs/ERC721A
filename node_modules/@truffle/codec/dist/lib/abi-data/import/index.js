"use strict";
/**
 * @protected
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.abiParameterToType = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:abi-data:import");
const bn_js_1 = __importDefault(require("bn.js"));
function abiParameterToType(abi) {
    let typeName = abi.type;
    let typeHint = abi.internalType;
    //first: is it an array?
    let arrayMatch = typeName.match(/(.*)\[(\d*)\]$/);
    if (arrayMatch) {
        let baseTypeName = arrayMatch[1];
        let lengthAsString = arrayMatch[2]; //may be empty!
        let baseAbi = Object.assign(Object.assign({}, abi), { type: baseTypeName });
        let baseType = abiParameterToType(baseAbi);
        if (lengthAsString === "") {
            return {
                typeClass: "array",
                kind: "dynamic",
                baseType,
                typeHint
            };
        }
        else {
            let length = new bn_js_1.default(lengthAsString);
            return {
                typeClass: "array",
                kind: "static",
                length,
                baseType,
                typeHint
            };
        }
    }
    //otherwise, here are the simple cases
    let typeClass = typeName.match(/^([^0-9]+)/)[1];
    switch (typeClass) {
        case "uint":
        case "int": {
            let bits = typeName.match(/^u?int([0-9]+)/)[1];
            return {
                typeClass,
                bits: parseInt(bits),
                typeHint
            };
        }
        case "bytes":
            let length = typeName.match(/^bytes([0-9]*)/)[1];
            if (length === "") {
                return {
                    typeClass,
                    kind: "dynamic",
                    typeHint
                };
            }
            else {
                return {
                    typeClass,
                    kind: "static",
                    length: parseInt(length),
                    typeHint
                };
            }
        case "address":
            return {
                typeClass,
                kind: "general",
                typeHint
            };
        case "string":
        case "bool":
            return {
                typeClass,
                typeHint
            };
        case "fixed":
        case "ufixed": {
            let [_, bits, places] = typeName.match(/^u?fixed([0-9]+)x([0-9]+)/);
            return {
                typeClass,
                bits: parseInt(bits),
                places: parseInt(places),
                typeHint
            };
        }
        case "function":
            return {
                typeClass,
                visibility: "external",
                kind: "general",
                typeHint
            };
        case "tuple":
            let memberTypes = abi.components.map(component => ({
                name: component.name || undefined,
                type: abiParameterToType(component)
            }));
            return {
                typeClass,
                memberTypes,
                typeHint
            };
    }
}
exports.abiParameterToType = abiParameterToType;
//# sourceMappingURL=index.js.map