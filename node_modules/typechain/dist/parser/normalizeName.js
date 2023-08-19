"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeName = void 0;
const lodash_1 = require("lodash");
/**
 * Converts valid file names to valid javascript symbols and does best effort to make them readable. Example: ds-token.test becomes DsTokenTest
 */
function normalizeName(rawName) {
    const t1 = rawName.split(' ').join('-'); // spaces to - so later we can automatically convert them
    const t2 = t1.replace(/^\d+/, ''); // removes leading digits
    const result = lodash_1.upperFirst(lodash_1.camelCase(t2));
    if (result === '') {
        throw new Error(`Can't guess class name, please rename file: ${rawName}`);
    }
    return result;
}
exports.normalizeName = normalizeName;
//# sourceMappingURL=normalizeName.js.map