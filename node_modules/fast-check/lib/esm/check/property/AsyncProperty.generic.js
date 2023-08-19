import { PreconditionFailure } from '../precondition/PreconditionFailure.js';
import { runIdToFrequency } from './IRawProperty.js';
import { readConfigureGlobal } from '../runner/configuration/GlobalParameters.js';
import { Stream } from '../../stream/Stream.js';
import { convertToNext } from '../arbitrary/definition/Converters.js';
import { noUndefinedAsContext, UndefinedContextPlaceholder, } from '../../arbitrary/_internals/helpers/NoUndefinedAsContext.js';
export class AsyncProperty {
    constructor(rawArb, predicate) {
        this.predicate = predicate;
        const { asyncBeforeEach, asyncAfterEach, beforeEach, afterEach } = readConfigureGlobal() || {};
        if (asyncBeforeEach !== undefined && beforeEach !== undefined) {
            throw Error('Global "asyncBeforeEach" and "beforeEach" parameters can\'t be set at the same time when running async properties');
        }
        if (asyncAfterEach !== undefined && afterEach !== undefined) {
            throw Error('Global "asyncAfterEach" and "afterEach" parameters can\'t be set at the same time when running async properties');
        }
        this.beforeEachHook = asyncBeforeEach || beforeEach || AsyncProperty.dummyHook;
        this.afterEachHook = asyncAfterEach || afterEach || AsyncProperty.dummyHook;
        this.arb = convertToNext(rawArb);
    }
    isAsync() {
        return true;
    }
    generate(mrng, runId) {
        const value = this.arb.generate(mrng, runId != null ? runIdToFrequency(runId) : undefined);
        return noUndefinedAsContext(value);
    }
    shrink(value) {
        if (value.context === undefined && !this.arb.canShrinkWithoutContext(value.value_)) {
            return Stream.nil();
        }
        const safeContext = value.context !== UndefinedContextPlaceholder ? value.context : undefined;
        return this.arb.shrink(value.value_, safeContext).map(noUndefinedAsContext);
    }
    async run(v) {
        await this.beforeEachHook();
        try {
            const output = await this.predicate(v);
            return output == null || output === true ? null : 'Property failed by returning false';
        }
        catch (err) {
            if (PreconditionFailure.isFailure(err))
                return err;
            if (err instanceof Error && err.stack)
                return `${err}\n\nStack trace: ${err.stack}`;
            return `${err}`;
        }
        finally {
            await this.afterEachHook();
        }
    }
    beforeEach(hookFunction) {
        const previousBeforeEachHook = this.beforeEachHook;
        this.beforeEachHook = () => hookFunction(previousBeforeEachHook);
        return this;
    }
    afterEach(hookFunction) {
        const previousAfterEachHook = this.afterEachHook;
        this.afterEachHook = () => hookFunction(previousAfterEachHook);
        return this;
    }
}
AsyncProperty.dummyHook = () => { };
