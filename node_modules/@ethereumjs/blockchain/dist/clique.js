"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIQUE_NONCE_DROP = exports.CLIQUE_NONCE_AUTH = void 0;
// Magic nonce number to vote on adding a new signer
exports.CLIQUE_NONCE_AUTH = Buffer.from('ffffffffffffffff', 'hex');
// Magic nonce number to vote on removing a signer.
exports.CLIQUE_NONCE_DROP = Buffer.alloc(8);
//# sourceMappingURL=clique.js.map