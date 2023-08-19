"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeInternalFunctionId = exports.functionTableEntryToType = void 0;
const import_1 = require("../../contexts/import");
//creates a type object for the contract the function was defined in
function functionTableEntryToType(functionEntry) {
    if (functionEntry.contractNode === null) {
        //for free functions
        return null;
    }
    return {
        typeClass: "contract",
        kind: "native",
        id: import_1.makeTypeId(functionEntry.contractId, functionEntry.compilationId),
        typeName: functionEntry.contractName,
        contractKind: functionEntry.contractKind,
        payable: functionEntry.contractPayable
    };
}
exports.functionTableEntryToType = functionTableEntryToType;
function makeInternalFunctionId(functionEntry) {
    return `${functionEntry.compilationId}:${functionEntry.id}`;
}
exports.makeInternalFunctionId = makeInternalFunctionId;
//# sourceMappingURL=index.js.map