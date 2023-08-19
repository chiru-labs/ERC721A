"use strict";
/**
 * Contains functions for dealing with raw bytestrings
 * @protected
 *
 * @packageDocumentation
 */
//Category: Common data location
//[NOT making this an actual category for now
//since there's nothing public in it]
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
exports.Encode = exports.Decode = exports.Read = void 0;
const Read = __importStar(require("./read"));
exports.Read = Read;
const Decode = __importStar(require("./decode"));
exports.Decode = Decode;
const Encode = __importStar(require("./encode"));
exports.Encode = Encode;
//# sourceMappingURL=index.js.map