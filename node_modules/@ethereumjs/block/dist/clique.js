"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIQUE_DIFF_NOTURN = exports.CLIQUE_DIFF_INTURN = exports.CLIQUE_EXTRA_SEAL = exports.CLIQUE_EXTRA_VANITY = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
// Fixed number of extra-data prefix bytes reserved for signer vanity
exports.CLIQUE_EXTRA_VANITY = 32;
// Fixed number of extra-data suffix bytes reserved for signer seal
exports.CLIQUE_EXTRA_SEAL = 65;
// Block difficulty for in-turn signatures
exports.CLIQUE_DIFF_INTURN = new ethereumjs_util_1.BN(2);
// Block difficulty for in-turn signatures
exports.CLIQUE_DIFF_NOTURN = new ethereumjs_util_1.BN(1);
//# sourceMappingURL=clique.js.map