"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixedCaseArbitrary = void 0;
const bigUintN_1 = require("../bigUintN");
const NextArbitrary_1 = require("../../check/arbitrary/definition/NextArbitrary");
const Converters_1 = require("../../check/arbitrary/definition/Converters");
const NextValue_1 = require("../../check/arbitrary/definition/NextValue");
const LazyIterableIterator_1 = require("../../stream/LazyIterableIterator");
const ToggleFlags_1 = require("./helpers/ToggleFlags");
class MixedCaseArbitrary extends NextArbitrary_1.NextArbitrary {
    constructor(stringArb, toggleCase, untoggleAll) {
        super();
        this.stringArb = stringArb;
        this.toggleCase = toggleCase;
        this.untoggleAll = untoggleAll;
    }
    buildContextFor(rawStringNextValue, flagsNextValue) {
        return {
            rawString: rawStringNextValue.value,
            rawStringContext: rawStringNextValue.context,
            flags: flagsNextValue.value,
            flagsContext: flagsNextValue.context,
        };
    }
    generate(mrng, biasFactor) {
        const rawStringNextValue = this.stringArb.generate(mrng, biasFactor);
        const chars = [...rawStringNextValue.value];
        const togglePositions = (0, ToggleFlags_1.computeTogglePositions)(chars, this.toggleCase);
        const flagsArb = (0, Converters_1.convertToNext)((0, bigUintN_1.bigUintN)(togglePositions.length));
        const flagsNextValue = flagsArb.generate(mrng, undefined);
        (0, ToggleFlags_1.applyFlagsOnChars)(chars, flagsNextValue.value, togglePositions, this.toggleCase);
        return new NextValue_1.NextValue(chars.join(''), this.buildContextFor(rawStringNextValue, flagsNextValue));
    }
    canShrinkWithoutContext(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return this.untoggleAll !== undefined
            ? this.stringArb.canShrinkWithoutContext(this.untoggleAll(value))
            :
                this.stringArb.canShrinkWithoutContext(value);
    }
    shrink(value, context) {
        let contextSafe;
        if (context !== undefined) {
            contextSafe = context;
        }
        else {
            if (this.untoggleAll !== undefined) {
                const untoggledValue = this.untoggleAll(value);
                const valueChars = [...value];
                const untoggledValueChars = [...untoggledValue];
                const togglePositions = (0, ToggleFlags_1.computeTogglePositions)(untoggledValueChars, this.toggleCase);
                contextSafe = {
                    rawString: untoggledValue,
                    rawStringContext: undefined,
                    flags: (0, ToggleFlags_1.computeFlagsFromChars)(untoggledValueChars, valueChars, togglePositions),
                    flagsContext: undefined,
                };
            }
            else {
                contextSafe = {
                    rawString: value,
                    rawStringContext: undefined,
                    flags: BigInt(0),
                    flagsContext: undefined,
                };
            }
        }
        const rawString = contextSafe.rawString;
        const flags = contextSafe.flags;
        return this.stringArb
            .shrink(rawString, contextSafe.rawStringContext)
            .map((nRawStringNextValue) => {
            const nChars = [...nRawStringNextValue.value];
            const nTogglePositions = (0, ToggleFlags_1.computeTogglePositions)(nChars, this.toggleCase);
            const nFlags = (0, ToggleFlags_1.computeNextFlags)(flags, nTogglePositions.length);
            (0, ToggleFlags_1.applyFlagsOnChars)(nChars, nFlags, nTogglePositions, this.toggleCase);
            return new NextValue_1.NextValue(nChars.join(''), this.buildContextFor(nRawStringNextValue, new NextValue_1.NextValue(nFlags, undefined)));
        })
            .join((0, LazyIterableIterator_1.makeLazy)(() => {
            const chars = [...rawString];
            const togglePositions = (0, ToggleFlags_1.computeTogglePositions)(chars, this.toggleCase);
            return (0, Converters_1.convertToNext)((0, bigUintN_1.bigUintN)(togglePositions.length))
                .shrink(flags, contextSafe.flagsContext)
                .map((nFlagsNextValue) => {
                const nChars = chars.slice();
                (0, ToggleFlags_1.applyFlagsOnChars)(nChars, nFlagsNextValue.value, togglePositions, this.toggleCase);
                return new NextValue_1.NextValue(nChars.join(''), this.buildContextFor(new NextValue_1.NextValue(rawString, contextSafe.rawStringContext), nFlagsNextValue));
            });
        }));
    }
}
exports.MixedCaseArbitrary = MixedCaseArbitrary;
