"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSstoreGas = exports.writeCallOutput = exports.subMemUsage = exports.maxCallGas = exports.jumpSubIsValid = exports.jumpIsValid = exports.getFullname = exports.getDataSlice = exports.short = exports.divCeil = exports.describeLocation = exports.addressToBuffer = exports.trap = exports.setLengthLeftStorage = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const exceptions_1 = require("./../../exceptions");
const EIP2929_1 = require("./EIP2929");
const MASK_160 = new ethereumjs_util_1.BN(1).shln(160).subn(1);
/**
 * Proxy function for ethereumjs-util's setLengthLeft, except it returns a zero
 *
 * length buffer in case the buffer is full of zeros.
 * @param {Buffer} value Buffer which we want to pad
 */
function setLengthLeftStorage(value) {
    if (value.equals(Buffer.alloc(value.length, 0))) {
        // return the empty buffer (the value is zero)
        return Buffer.alloc(0);
    }
    else {
        return (0, ethereumjs_util_1.setLengthLeft)(value, 32);
    }
}
exports.setLengthLeftStorage = setLengthLeftStorage;
/**
 * Wraps error message as VMError
 *
 * @param {string} err
 */
function trap(err) {
    // TODO: facilitate extra data along with errors
    throw new exceptions_1.VmError(err);
}
exports.trap = trap;
/**
 * Converts BN address (they're stored like this on the stack) to buffer address
 *
 * @param  {BN}     address
 * @return {Buffer}
 */
function addressToBuffer(address) {
    if (Buffer.isBuffer(address))
        return address;
    return address.and(MASK_160).toArrayLike(Buffer, 'be', 20);
}
exports.addressToBuffer = addressToBuffer;
/**
 * Error message helper - generates location string
 *
 * @param  {RunState} runState
 * @return {string}
 */
function describeLocation(runState) {
    const hash = (0, ethereumjs_util_1.keccak256)(runState.eei.getCode()).toString('hex');
    const address = runState.eei.getAddress().buf.toString('hex');
    const pc = runState.programCounter - 1;
    return `${hash}/${address}:${pc}`;
}
exports.describeLocation = describeLocation;
/**
 * Find Ceil(a / b)
 *
 * @param {BN} a
 * @param {BN} b
 * @return {BN}
 */
function divCeil(a, b) {
    const div = a.div(b);
    const mod = a.mod(b);
    // Fast case - exact division
    if (mod.isZero())
        return div;
    // Round up
    return div.isNeg() ? div.isubn(1) : div.iaddn(1);
}
exports.divCeil = divCeil;
function short(buffer) {
    const MAX_LENGTH = 50;
    const bufferStr = buffer.toString('hex');
    if (bufferStr.length <= MAX_LENGTH) {
        return bufferStr;
    }
    return bufferStr.slice(0, MAX_LENGTH) + '...';
}
exports.short = short;
/**
/**
 * Returns an overflow-safe slice of an array. It right-pads
 * the data with zeros to `length`.
 *
 * @param {BN} offset
 * @param {BN} length
 * @param {Buffer} data
 * @returns {Buffer}
 */
function getDataSlice(data, offset, length) {
    const len = new ethereumjs_util_1.BN(data.length);
    if (offset.gt(len)) {
        offset = len;
    }
    let end = offset.add(length);
    if (end.gt(len)) {
        end = len;
    }
    data = data.slice(offset.toNumber(), end.toNumber());
    // Right-pad with zeros to fill dataLength bytes
    data = (0, ethereumjs_util_1.setLengthRight)(data, length.toNumber());
    return data;
}
exports.getDataSlice = getDataSlice;
/**
 * Get full opcode name from its name and code.
 *
 * @param code {number} Integer code of opcode.
 * @param name {string} Short name of the opcode.
 * @returns {string} Full opcode name
 */
function getFullname(code, name) {
    switch (name) {
        case 'LOG':
            name += code - 0xa0;
            break;
        case 'PUSH':
            name += code - 0x5f;
            break;
        case 'DUP':
            name += code - 0x7f;
            break;
        case 'SWAP':
            name += code - 0x8f;
            break;
    }
    return name;
}
exports.getFullname = getFullname;
/**
 * Checks if a jump is valid given a destination
 *
 * @param  {RunState} runState
 * @param  {number}   dest
 * @return {boolean}
 */
function jumpIsValid(runState, dest) {
    return runState.validJumps.indexOf(dest) !== -1;
}
exports.jumpIsValid = jumpIsValid;
/**
 * Checks if a jumpsub is valid given a destination
 *
 * @param  {RunState} runState
 * @param  {number}   dest
 * @return {boolean}
 */
function jumpSubIsValid(runState, dest) {
    return runState.validJumpSubs.indexOf(dest) !== -1;
}
exports.jumpSubIsValid = jumpSubIsValid;
/**
 * Returns an overflow-safe slice of an array. It right-pads
 *
 * the data with zeros to `length`.
 * @param {BN} gasLimit - requested gas Limit
 * @param {BN} gasLeft - current gas left
 * @param {RunState} runState - the current runState
 * @param {Common} common - the common
 */
function maxCallGas(gasLimit, gasLeft, runState, common) {
    const isTangerineWhistleOrLater = common.gteHardfork('tangerineWhistle');
    if (isTangerineWhistleOrLater) {
        const gasAllowed = gasLeft.sub(gasLeft.divn(64));
        return gasLimit.gt(gasAllowed) ? gasAllowed : gasLimit;
    }
    else {
        return gasLimit;
    }
}
exports.maxCallGas = maxCallGas;
/**
 * Subtracts the amount needed for memory usage from `runState.gasLeft`
 *
 * @method subMemUsage
 * @param {Object} runState
 * @param {BN} offset
 * @param {BN} length
 */
function subMemUsage(runState, offset, length, common) {
    // YP (225): access with zero length will not extend the memory
    if (length.isZero())
        return;
    const newMemoryWordCount = divCeil(offset.add(length), new ethereumjs_util_1.BN(32));
    if (newMemoryWordCount.lte(runState.memoryWordCount))
        return;
    const words = newMemoryWordCount;
    const fee = new ethereumjs_util_1.BN(common.param('gasPrices', 'memory'));
    const quadCoeff = new ethereumjs_util_1.BN(common.param('gasPrices', 'quadCoeffDiv'));
    // words * 3 + words ^2 / 512
    const cost = words.mul(fee).add(words.mul(words).div(quadCoeff));
    if (cost.gt(runState.highestMemCost)) {
        runState.eei.useGas(cost.sub(runState.highestMemCost), 'subMemUsage');
        runState.highestMemCost = cost;
    }
    runState.memoryWordCount = newMemoryWordCount;
}
exports.subMemUsage = subMemUsage;
/**
 * Writes data returned by eei.call* methods to memory
 *
 * @param {RunState} runState
 * @param {BN}       outOffset
 * @param {BN}       outLength
 */
function writeCallOutput(runState, outOffset, outLength) {
    const returnData = runState.eei.getReturnData();
    if (returnData.length > 0) {
        const memOffset = outOffset.toNumber();
        let dataLength = outLength.toNumber();
        if (returnData.length < dataLength) {
            dataLength = returnData.length;
        }
        const data = getDataSlice(returnData, new ethereumjs_util_1.BN(0), new ethereumjs_util_1.BN(dataLength));
        runState.memory.extend(memOffset, dataLength);
        runState.memory.write(memOffset, dataLength, data);
    }
}
exports.writeCallOutput = writeCallOutput;
/** The first rule set of SSTORE rules, which are the rules pre-Constantinople and in Petersburg
 * @param {RunState} runState
 * @param {Buffer}   currentStorage
 * @param {Buffer}   value
 * @param {Buffer}   keyBuf
 */
function updateSstoreGas(runState, currentStorage, value, keyBuf, common) {
    const sstoreResetCost = common.param('gasPrices', 'sstoreReset');
    if ((value.length === 0 && !currentStorage.length) ||
        (value.length !== 0 && currentStorage.length)) {
        runState.eei.useGas(new ethereumjs_util_1.BN((0, EIP2929_1.adjustSstoreGasEIP2929)(runState, keyBuf, sstoreResetCost, 'reset', common)), 'updateSstoreGas');
    }
    else if (value.length === 0 && currentStorage.length) {
        runState.eei.useGas(new ethereumjs_util_1.BN((0, EIP2929_1.adjustSstoreGasEIP2929)(runState, keyBuf, sstoreResetCost, 'reset', common)), 'updateSstoreGas');
        runState.eei.refundGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'sstoreRefund')), 'updateSstoreGas');
    }
    else if (value.length !== 0 && !currentStorage.length) {
        runState.eei.useGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'sstoreSet')), 'updateSstoreGas');
    }
}
exports.updateSstoreGas = updateSstoreGas;
//# sourceMappingURL=util.js.map