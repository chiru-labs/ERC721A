"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
class Message {
    constructor(opts) {
        this.to = opts.to;
        this.value = opts.value ? opts.value : new ethereumjs_util_1.BN(0);
        this.caller = opts.caller;
        this.gasLimit = opts.gasLimit;
        this.data = opts.data || Buffer.alloc(0);
        this.depth = opts.depth || 0;
        this.code = opts.code;
        this._codeAddress = opts.codeAddress;
        this.isStatic = opts.isStatic || false;
        this.isCompiled = opts.isCompiled || false; // For CALLCODE, TODO: Move from here
        this.salt = opts.salt; // For CREATE2, TODO: Move from here
        this.selfdestruct = opts.selfdestruct; // TODO: Move from here
        this.delegatecall = opts.delegatecall || false;
    }
    get codeAddress() {
        return this._codeAddress ? this._codeAddress : this.to;
    }
}
exports.default = Message;
//# sourceMappingURL=message.js.map