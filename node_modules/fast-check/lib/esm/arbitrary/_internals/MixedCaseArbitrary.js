import { bigUintN } from '../bigUintN.js';
import { NextArbitrary } from '../../check/arbitrary/definition/NextArbitrary.js';
import { convertToNext } from '../../check/arbitrary/definition/Converters.js';
import { NextValue } from '../../check/arbitrary/definition/NextValue.js';
import { makeLazy } from '../../stream/LazyIterableIterator.js';
import { applyFlagsOnChars, computeFlagsFromChars, computeNextFlags, computeTogglePositions, } from './helpers/ToggleFlags.js';
export class MixedCaseArbitrary extends NextArbitrary {
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
        const togglePositions = computeTogglePositions(chars, this.toggleCase);
        const flagsArb = convertToNext(bigUintN(togglePositions.length));
        const flagsNextValue = flagsArb.generate(mrng, undefined);
        applyFlagsOnChars(chars, flagsNextValue.value, togglePositions, this.toggleCase);
        return new NextValue(chars.join(''), this.buildContextFor(rawStringNextValue, flagsNextValue));
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
                const togglePositions = computeTogglePositions(untoggledValueChars, this.toggleCase);
                contextSafe = {
                    rawString: untoggledValue,
                    rawStringContext: undefined,
                    flags: computeFlagsFromChars(untoggledValueChars, valueChars, togglePositions),
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
            const nTogglePositions = computeTogglePositions(nChars, this.toggleCase);
            const nFlags = computeNextFlags(flags, nTogglePositions.length);
            applyFlagsOnChars(nChars, nFlags, nTogglePositions, this.toggleCase);
            return new NextValue(nChars.join(''), this.buildContextFor(nRawStringNextValue, new NextValue(nFlags, undefined)));
        })
            .join(makeLazy(() => {
            const chars = [...rawString];
            const togglePositions = computeTogglePositions(chars, this.toggleCase);
            return convertToNext(bigUintN(togglePositions.length))
                .shrink(flags, contextSafe.flagsContext)
                .map((nFlagsNextValue) => {
                const nChars = chars.slice();
                applyFlagsOnChars(nChars, nFlagsNextValue.value, togglePositions, this.toggleCase);
                return new NextValue(nChars.join(''), this.buildContextFor(new NextValue(rawString, contextSafe.rawStringContext), nFlagsNextValue));
            });
        }));
    }
}
