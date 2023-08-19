"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivePrecompiles = exports.ripemdPrecompileAddress = exports.getPrecompile = exports.precompiles = void 0;
var ethereumjs_util_1 = require("ethereumjs-util");
var _01_ecrecover_1 = __importDefault(require("./01-ecrecover"));
var _02_sha256_1 = __importDefault(require("./02-sha256"));
var _03_ripemd160_1 = __importDefault(require("./03-ripemd160"));
var _04_identity_1 = __importDefault(require("./04-identity"));
var _05_modexp_1 = __importDefault(require("./05-modexp"));
var _06_ecadd_1 = __importDefault(require("./06-ecadd"));
var _07_ecmul_1 = __importDefault(require("./07-ecmul"));
var _08_ecpairing_1 = __importDefault(require("./08-ecpairing"));
var _09_blake2f_1 = __importDefault(require("./09-blake2f"));
var _0a_bls12_g1add_1 = __importDefault(require("./0a-bls12-g1add"));
var _0b_bls12_g1mul_1 = __importDefault(require("./0b-bls12-g1mul"));
var _0c_bls12_g1multiexp_1 = __importDefault(require("./0c-bls12-g1multiexp"));
var _0d_bls12_g2add_1 = __importDefault(require("./0d-bls12-g2add"));
var _0e_bls12_g2mul_1 = __importDefault(require("./0e-bls12-g2mul"));
var _0f_bls12_g2multiexp_1 = __importDefault(require("./0f-bls12-g2multiexp"));
var _10_bls12_pairing_1 = __importDefault(require("./10-bls12-pairing"));
var _11_bls12_map_fp_to_g1_1 = __importDefault(require("./11-bls12-map-fp-to-g1"));
var _12_bls12_map_fp2_to_g2_1 = __importDefault(require("./12-bls12-map-fp2-to-g2"));
var PrecompileAvailabilityCheck;
(function (PrecompileAvailabilityCheck) {
    PrecompileAvailabilityCheck[PrecompileAvailabilityCheck["EIP"] = 0] = "EIP";
    PrecompileAvailabilityCheck[PrecompileAvailabilityCheck["Hardfork"] = 1] = "Hardfork";
})(PrecompileAvailabilityCheck || (PrecompileAvailabilityCheck = {}));
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
    _a['000000000000000000000000000000000000000a'] = _0a_bls12_g1add_1.default,
    _a['000000000000000000000000000000000000000b'] = _0b_bls12_g1mul_1.default,
    _a['000000000000000000000000000000000000000c'] = _0c_bls12_g1multiexp_1.default,
    _a['000000000000000000000000000000000000000d'] = _0d_bls12_g2add_1.default,
    _a['000000000000000000000000000000000000000e'] = _0e_bls12_g2mul_1.default,
    _a['000000000000000000000000000000000000000f'] = _0f_bls12_g2multiexp_1.default,
    _a['0000000000000000000000000000000000000010'] = _10_bls12_pairing_1.default,
    _a['0000000000000000000000000000000000000011'] = _11_bls12_map_fp_to_g1_1.default,
    _a['0000000000000000000000000000000000000012'] = _12_bls12_map_fp2_to_g2_1.default,
    _a);
exports.precompiles = precompiles;
var precompileAvailability = (_b = {
        '0000000000000000000000000000000000000001': {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: 'chainstart',
        },
        '0000000000000000000000000000000000000002': {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: 'chainstart',
        }
    },
    _b[ripemdPrecompileAddress] = {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: 'chainstart',
    },
    _b['0000000000000000000000000000000000000004'] = {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: 'chainstart',
    },
    _b['0000000000000000000000000000000000000005'] = {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: 'byzantium',
    },
    _b['0000000000000000000000000000000000000006'] = {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: 'byzantium',
    },
    _b['0000000000000000000000000000000000000007'] = {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: 'byzantium',
    },
    _b['0000000000000000000000000000000000000008'] = {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: 'byzantium',
    },
    _b['0000000000000000000000000000000000000009'] = {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: 'istanbul',
    },
    _b['000000000000000000000000000000000000000a'] = {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    _b['000000000000000000000000000000000000000b'] = {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    _b['000000000000000000000000000000000000000c'] = {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    _b['000000000000000000000000000000000000000d'] = {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    _b['000000000000000000000000000000000000000f'] = {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    _b['000000000000000000000000000000000000000e'] = {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    _b['0000000000000000000000000000000000000010'] = {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    _b['0000000000000000000000000000000000000011'] = {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    _b['0000000000000000000000000000000000000012'] = {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    _b);
function getPrecompile(address, common) {
    var addr = address.buf.toString('hex');
    if (precompiles[addr]) {
        var availability = precompileAvailability[addr];
        if ((availability.type == PrecompileAvailabilityCheck.Hardfork &&
            common.gteHardfork(availability.param)) ||
            (availability.type == PrecompileAvailabilityCheck.EIP &&
                common.eips().includes(availability.param))) {
            return precompiles[addr];
        }
    }
    return precompiles[''];
}
exports.getPrecompile = getPrecompile;
function getActivePrecompiles(common) {
    var activePrecompiles = [];
    for (var addressString in precompiles) {
        var address = new ethereumjs_util_1.Address(Buffer.from(addressString, 'hex'));
        if (getPrecompile(address, common)) {
            activePrecompiles.push(address);
        }
    }
    return activePrecompiles;
}
exports.getActivePrecompiles = getActivePrecompiles;
//# sourceMappingURL=index.js.map