"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ERROR;
(function (ERROR) {
    ERROR["OUT_OF_GAS"] = "out of gas";
    ERROR["STACK_UNDERFLOW"] = "stack underflow";
    ERROR["STACK_OVERFLOW"] = "stack overflow";
    ERROR["INVALID_JUMP"] = "invalid JUMP";
    ERROR["INVALID_OPCODE"] = "invalid opcode";
    ERROR["OUT_OF_RANGE"] = "value out of range";
    ERROR["REVERT"] = "revert";
    ERROR["STATIC_STATE_CHANGE"] = "static state change";
    ERROR["INTERNAL_ERROR"] = "internal error";
    ERROR["CREATE_COLLISION"] = "create collision";
    ERROR["STOP"] = "stop";
    ERROR["REFUND_EXHAUSTED"] = "refund exhausted";
})(ERROR = exports.ERROR || (exports.ERROR = {}));
var VmError = /** @class */ (function () {
    function VmError(error) {
        this.error = error;
        this.errorType = 'VmError';
    }
    return VmError;
}());
exports.VmError = VmError;
//# sourceMappingURL=exceptions.js.map