"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codegenForOverloadedFunctions = exports.codegenFunctions = void 0;
const typechain_1 = require("typechain");
const types_1 = require("./types");
function codegenFunctions(options, fns) {
    if (fns.length === 1) {
        return `${generateFunction(options, fns[0])}${codegenForOverloadedFunctions(options, fns)}`;
    }
    return codegenForOverloadedFunctions(options, fns);
}
exports.codegenFunctions = codegenFunctions;
function codegenForOverloadedFunctions(options, fns) {
    return fns.map((fn) => generateFunction(options, fn, `"${typechain_1.getSignatureForFn(fn)}"`)).join('\n');
}
exports.codegenForOverloadedFunctions = codegenForOverloadedFunctions;
function isPayable(fn) {
    return fn.stateMutability === 'payable';
}
function generateFunction(options, fn, overloadedName) {
    var _a;
    return `
  ${generateFunctionDocumentation(fn.documentation)}
  ${overloadedName !== null && overloadedName !== void 0 ? overloadedName : fn.name}(${types_1.generateInputTypes(fn.inputs)}${!options.isStaticCall && !typechain_1.isConstant(fn) && !typechain_1.isConstantFn(fn)
        ? `overrides?: ${isPayable(fn) ? 'PayableOverrides' : 'Overrides'}`
        : 'overrides?: CallOverrides'}): ${(_a = options.overrideOutput) !== null && _a !== void 0 ? _a : `Promise<${options.isStaticCall || fn.stateMutability === 'pure' || fn.stateMutability === 'view'
        ? types_1.generateOutputTypes(!!options.returnResultObject, fn.outputs)
        : 'ContractTransaction'}>`};
`;
}
function generateFunctionDocumentation(doc) {
    if (!doc)
        return '';
    let docString = '/**';
    if (doc.details)
        docString += `\n * ${doc.details}`;
    if (doc.notice)
        docString += `\n * ${doc.notice}`;
    const params = Object.entries(doc.params || {});
    if (params.length) {
        params.forEach(([key, value]) => {
            docString += `\n * @param ${key} ${value}`;
        });
    }
    if (doc.return)
        docString += `\n * @returns ${doc.return}`;
    docString += '\n */';
    return docString;
}
//# sourceMappingURL=functions.js.map