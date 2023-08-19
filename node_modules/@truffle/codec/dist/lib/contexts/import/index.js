"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTypeId = exports.contextToType = void 0;
function contextToType(context) {
    if (context.contractId !== undefined) {
        return {
            typeClass: "contract",
            kind: "native",
            id: makeTypeId(context.contractId, context.compilationId),
            typeName: context.contractName,
            contractKind: context.contractKind,
            payable: context.payable
        };
    }
    else {
        return {
            typeClass: "contract",
            kind: "foreign",
            typeName: context.contractName,
            contractKind: context.contractKind,
            payable: context.payable
        };
    }
}
exports.contextToType = contextToType;
//NOTE: I am exporting this for use in other import functions, but please don't
//use this elsewhere!
//If you have to make a type ID, instead make the type and then
//take its ID.
function makeTypeId(astId, compilationId) {
    return `${compilationId}:${astId}`;
}
exports.makeTypeId = makeTypeId;
//# sourceMappingURL=index.js.map