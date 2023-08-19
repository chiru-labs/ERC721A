"use strict";
/**
 * @protected
 *
 * @packageDocumentation
 */
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
exports.readDefinition = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:ast:read");
const Conversion = __importStar(require("../../conversion"));
const Evm = __importStar(require("../../evm"));
const Ast = __importStar(require("../../ast"));
const errors_1 = require("../../errors");
function readDefinition(pointer) {
    const definition = pointer.definition;
    debug("definition %o", definition);
    switch (Ast.Utils.typeClass(definition)) {
        case "rational":
            let numericalValue = Ast.Utils.rationalValue(definition);
            return Conversion.toBytes(numericalValue, Evm.Utils.WORD_SIZE);
        //you may be wondering, why do we not just use definition.value here,
        //like we do below? answer: because if this isn't a literal, that may not
        //exist
        case "stringliteral":
            return Conversion.toBytes(definition.hexValue);
        default:
            //unfortunately, other types of constants are just too complicated to
            //handle right now.  sorry.
            debug("unsupported constant definition type");
            throw new errors_1.DecodingError({
                kind: "UnsupportedConstantError",
                definition
            });
    }
}
exports.readDefinition = readDefinition;
//# sourceMappingURL=index.js.map