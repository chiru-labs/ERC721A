"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var _01_ecrecover_1 = require("./01-ecrecover");
var _02_sha256_1 = require("./02-sha256");
var _03_ripemd160_1 = require("./03-ripemd160");
var _04_identity_1 = require("./04-identity");
var _05_modexp_1 = require("./05-modexp");
var _06_ecadd_1 = require("./06-ecadd");
var _07_ecmul_1 = require("./07-ecmul");
var _08_ecpairing_1 = require("./08-ecpairing");
var _09_blake2f_1 = require("./09-blake2f");
var ripemdPrecompileAddress = '0000000000000000000000000000000000000003';
exports.ripemdPrecompileAddress = ripemdPrecompileAddress;
var precompiles = (_a = {
        '0000000000000000000000000000000000000001': _01_ecrecover_1.default,
        '0000000000000000000000000000000000000002': _02_sha256_1.default
    },
    _a[ripemdPrecompileAddress] = _03_ripemd160_1.default,
    _a['0000000000000000000000000000000000000004'] = _04_identity_1.default,
    _a['0000000000000000000000000000000000000005'] = _05_modexp_1.default,
    _a['0000000000000000000000000000000000000006'] = _06_ecadd_1.default,
    _a['0000000000000000000000000000000000000007'] = _07_ecmul_1.default,
    _a['0000000000000000000000000000000000000008'] = _08_ecpairing_1.default,
    _a['0000000000000000000000000000000000000009'] = _09_blake2f_1.default,
    _a);
exports.precompiles = precompiles;
function getPrecompile(address) {
    return precompiles[address];
}
exports.getPrecompile = getPrecompile;
//# sourceMappingURL=index.js.map