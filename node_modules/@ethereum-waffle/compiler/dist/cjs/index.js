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
exports.inputToConfig = void 0;
__exportStar(require("./compiler"), exports);
__exportStar(require("./flattener"), exports);
__exportStar(require("./link"), exports);
__exportStar(require("./generateTypes"), exports);
var config_1 = require("./config");
Object.defineProperty(exports, "inputToConfig", { enumerable: true, get: function () { return config_1.inputToConfig; } });
