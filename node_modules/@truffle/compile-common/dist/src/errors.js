"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompileError = void 0;
const colors_1 = __importDefault(require("colors"));
const error_1 = __importDefault(require("@truffle/error"));
class CompileError extends error_1.default {
    constructor(message) {
        // Note we trim() because solc likes to add extra whitespace.
        var fancy_message = message.trim() + "\n\n" + colors_1.default.red("Compilation failed. See above.");
        var normal_message = message.trim();
        super(normal_message);
        this.message = fancy_message; //?? I don't understand this, I just found it here
    }
}
exports.CompileError = CompileError;
//# sourceMappingURL=errors.js.map