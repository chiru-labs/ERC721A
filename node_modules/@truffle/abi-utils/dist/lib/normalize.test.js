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
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-extended");
const jest_fast_check_1 = require("jest-fast-check");
const Arbitrary = __importStar(require("./arbitrary"));
const normalize_1 = require("./normalize");
describe("normalize", () => {
    jest_fast_check_1.testProp(`fills in "type" property for function entries`, [Arbitrary.Abi()], looseAbi => {
        const abi = normalize_1.normalize(looseAbi);
        expect(abi).toSatisfyAll(entry => "type" in entry);
    });
    jest_fast_check_1.testProp(`never includes "payable" or "constant"`, [Arbitrary.Abi()], looseAbi => {
        const abi = normalize_1.normalize(looseAbi);
        expect(abi).toSatisfyAll(entry => !("payable" in entry));
        expect(abi).toSatisfyAll(entry => !("constant" in entry));
    });
    jest_fast_check_1.testProp(`always includes "outputs" for function entries`, [Arbitrary.Abi()], looseAbi => {
        const abi = normalize_1.normalize(looseAbi);
        expect(abi.filter(({ type }) => type === "function")).toSatisfyAll(entry => "outputs" in entry);
        expect(abi).toSatisfyAll(entry => !("constant" in entry));
    });
    jest_fast_check_1.testProp(`always includes "stateMutability" for entries that aren't events or errors`, [Arbitrary.Abi()], looseAbi => {
        const abi = normalize_1.normalize(looseAbi);
        expect(abi.filter(({ type }) => type !== "event" && type !== "error")).toSatisfyAll(entry => "stateMutability" in entry);
    });
    jest_fast_check_1.testProp("is idempotent", [Arbitrary.Abi()], looseAbi => {
        const abi = normalize_1.normalize(looseAbi);
        expect(normalize_1.normalize(abi)).toEqual(abi);
    });
});
//# sourceMappingURL=normalize.test.js.map