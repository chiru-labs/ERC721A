"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeForMultilineComments = exports.escapeForTemplateString = void 0;
function escapeForTemplateString(originalText) {
    return originalText.replace(/([$`\\])/g, '\\$1').replace(/\r/g, '\\r');
}
exports.escapeForTemplateString = escapeForTemplateString;
function escapeForMultilineComments(originalText) {
    return originalText.replace(/\*\//g, '*\\/');
}
exports.escapeForMultilineComments = escapeForMultilineComments;
