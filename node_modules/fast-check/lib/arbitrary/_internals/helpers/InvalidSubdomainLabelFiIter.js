"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterInvalidSubdomainLabel = void 0;
function filterInvalidSubdomainLabel(subdomainLabel) {
    if (subdomainLabel.length > 63) {
        return false;
    }
    return (subdomainLabel.length < 4 ||
        subdomainLabel[0] !== 'x' ||
        subdomainLabel[1] !== 'n' ||
        subdomainLabel[2] !== '-' ||
        subdomainLabel[3] !== '-');
}
exports.filterInvalidSubdomainLabel = filterInvalidSubdomainLabel;
