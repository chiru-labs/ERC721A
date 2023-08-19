"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFlagsOnChars = exports.computeFlagsFromChars = exports.computeTogglePositions = exports.computeNextFlags = exports.countToggledBits = void 0;
function countToggledBits(n) {
    let count = 0;
    while (n > BigInt(0)) {
        if (n & BigInt(1))
            ++count;
        n >>= BigInt(1);
    }
    return count;
}
exports.countToggledBits = countToggledBits;
function computeNextFlags(flags, nextSize) {
    const allowedMask = (BigInt(1) << BigInt(nextSize)) - BigInt(1);
    const preservedFlags = flags & allowedMask;
    let numMissingFlags = countToggledBits(flags - preservedFlags);
    let nFlags = preservedFlags;
    for (let mask = BigInt(1); mask <= allowedMask && numMissingFlags !== 0; mask <<= BigInt(1)) {
        if (!(nFlags & mask)) {
            nFlags |= mask;
            --numMissingFlags;
        }
    }
    return nFlags;
}
exports.computeNextFlags = computeNextFlags;
function computeTogglePositions(chars, toggleCase) {
    const positions = [];
    for (let idx = chars.length - 1; idx !== -1; --idx) {
        if (toggleCase(chars[idx]) !== chars[idx])
            positions.push(idx);
    }
    return positions;
}
exports.computeTogglePositions = computeTogglePositions;
function computeFlagsFromChars(untoggledChars, toggledChars, togglePositions) {
    let flags = BigInt(0);
    for (let idx = 0, mask = BigInt(1); idx !== togglePositions.length; ++idx, mask <<= BigInt(1)) {
        if (untoggledChars[togglePositions[idx]] !== toggledChars[togglePositions[idx]]) {
            flags |= mask;
        }
    }
    return flags;
}
exports.computeFlagsFromChars = computeFlagsFromChars;
function applyFlagsOnChars(chars, flags, togglePositions, toggleCase) {
    for (let idx = 0, mask = BigInt(1); idx !== togglePositions.length; ++idx, mask <<= BigInt(1)) {
        if (flags & mask)
            chars[togglePositions[idx]] = toggleCase(chars[togglePositions[idx]]);
    }
}
exports.applyFlagsOnChars = applyFlagsOnChars;
