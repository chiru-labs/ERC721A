"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VmError = exports.ERROR = void 0;
var ERROR;
(function (ERROR) {
    ERROR["OUT_OF_GAS"] = "out of gas";
    ERROR["CODESTORE_OUT_OF_GAS"] = "code store out of gas";
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
    ERROR["VALUE_OVERFLOW"] = "value overflow";
    ERROR["INVALID_BEGINSUB"] = "invalid BEGINSUB";
    ERROR["INVALID_RETURNSUB"] = "invalid RETURNSUB";
    ERROR["INVALID_JUMPSUB"] = "invalid JUMPSUB";
    ERROR["INVALID_BYTECODE_RESULT"] = "invalid bytecode deployed";
    // BLS errors
    ERROR["BLS_12_381_INVALID_INPUT_LENGTH"] = "invalid input length";
    ERROR["BLS_12_381_POINT_NOT_ON_CURVE"] = "point not on curve";
    ERROR["BLS_12_381_INPUT_EMPTY"] = "input is empty";
    ERROR["BLS_12_381_FP_NOT_IN_FIELD"] = "fp point not in field";
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