"use strict";
/**
 * For allocation, encoding, and decoding of locations related to the ABI
 * (calldata in Solidity, events, etc.)
 *
 * @category ABI data location
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = exports.Import = exports.Decode = exports.Encode = exports.Allocate = void 0;
const Allocate = __importStar(require("./allocate"));
exports.Allocate = Allocate;
const Encode = __importStar(require("./encode"));
exports.Encode = Encode;
const Decode = __importStar(require("./decode"));
exports.Decode = Decode;
const Import = __importStar(require("./import"));
exports.Import = Import;
__exportStar(require("./types"), exports); //can't do 'export type *'
const Utils = __importStar(require("./utils"));
exports.Utils = Utils;
//# sourceMappingURL=index.js.map