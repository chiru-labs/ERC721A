"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.link = exports.solidity = void 0;
__exportStar(require("@ethereum-waffle/provider"), exports);
var chai_1 = require("@ethereum-waffle/chai");
Object.defineProperty(exports, "solidity", { enumerable: true, get: function () { return chai_1.waffleChai; } });
var compiler_1 = require("@ethereum-waffle/compiler");
Object.defineProperty(exports, "link", { enumerable: true, get: function () { return compiler_1.link; } });
__exportStar(require("@ethereum-waffle/mock-contract"), exports);
__exportStar(require("./deployContract"), exports);
