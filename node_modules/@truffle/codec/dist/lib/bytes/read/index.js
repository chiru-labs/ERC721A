"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBytes = exports.readCode = void 0;
const Evm = __importStar(require("../../evm"));
const errors_1 = require("../../errors");
function* readCode(pointer, state) {
    let code = state.code;
    if (!code) {
        code = yield {
            type: "code",
            address: Evm.Utils.toAddress(state.specials.this)
        };
    }
    return readBytes(pointer, Object.assign(Object.assign({}, state), { code }));
}
exports.readCode = readCode;
function readBytes(pointer, state) {
    let sourceBytes = state[pointer.location];
    const { start: offset, length } = pointer;
    if (!Number.isSafeInteger(offset + length)) {
        throw new errors_1.DecodingError({
            kind: "ReadErrorBytes",
            location: pointer.location,
            start: offset,
            length
        });
    }
    // grab `length` bytes no matter what, here fill this array
    var bytes = new Uint8Array(length);
    bytes.fill(0); //fill it wil zeroes to start
    //if the start is beyond the end of the source, just return those 0s
    if (offset >= sourceBytes.length) {
        return bytes;
    }
    // if we're reading past the end of the source, truncate the length to read
    let excess = offset + length - sourceBytes.length;
    let readLength;
    if (excess > 0) {
        readLength = sourceBytes.length - offset;
    }
    else {
        readLength = length;
    }
    //get the (truncated) bytes
    let existing = new Uint8Array(sourceBytes.buffer, offset, readLength);
    //copy it into our buffer
    bytes.set(existing);
    return bytes;
}
exports.readBytes = readBytes;
//# sourceMappingURL=index.js.map