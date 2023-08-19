"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetConfigureGlobal = exports.readConfigureGlobal = exports.configureGlobal = void 0;
let globalParameters = {};
function configureGlobal(parameters) {
    globalParameters = parameters;
}
exports.configureGlobal = configureGlobal;
function readConfigureGlobal() {
    return globalParameters;
}
exports.readConfigureGlobal = readConfigureGlobal;
function resetConfigureGlobal() {
    globalParameters = {};
}
exports.resetConfigureGlobal = resetConfigureGlobal;
