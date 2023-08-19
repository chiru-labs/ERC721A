"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const PreconditionFailure_1 = require("../precondition/PreconditionFailure");
const IRawProperty_1 = require("./IRawProperty");
const GlobalParameters_1 = require("../runner/configuration/GlobalParameters");
const Converters_1 = require("../arbitrary/definition/Converters");
const Stream_1 = require("../../stream/Stream");
const NoUndefinedAsContext_1 = require("../../arbitrary/_internals/helpers/NoUndefinedAsContext");
class Property {
    constructor(rawArb, predicate) {
        this.predicate = predicate;
        const { beforeEach = Property.dummyHook, afterEach = Property.dummyHook, asyncBeforeEach, asyncAfterEach, } = (0, GlobalParameters_1.readConfigureGlobal)() || {};
        if (asyncBeforeEach !== undefined) {
            throw Error('"asyncBeforeEach" can\'t be set when running synchronous properties');
        }
        if (asyncAfterEach !== undefined) {
            throw Error('"asyncAfterEach" can\'t be set when running synchronous properties');
        }
        this.beforeEachHook = beforeEach;
        this.afterEachHook = afterEach;
        this.arb = (0, Converters_1.convertToNext)(rawArb);
    }
    isAsync() {
        return false;
    }
    generate(mrng, runId) {
        const value = this.arb.generate(mrng, runId != null ? (0, IRawProperty_1.runIdToFrequency)(runId) : undefined);
        return (0, NoUndefinedAsContext_1.noUndefinedAsContext)(value);
    }
    shrink(value) {
        if (value.context === undefined && !this.arb.canShrinkWithoutContext(value.value_)) {
            return Stream_1.Stream.nil();
        }
        const safeContext = value.context !== NoUndefinedAsContext_1.UndefinedContextPlaceholder ? value.context : undefined;
        return this.arb.shrink(value.value_, safeContext).map(NoUndefinedAsContext_1.noUndefinedAsContext);
    }
    run(v) {
        this.beforeEachHook();
        try {
            const output = this.predicate(v);
            return output == null || output === true ? null : 'Property failed by returning false';
        }
        catch (err) {
            if (PreconditionFailure_1.PreconditionFailure.isFailure(err))
                return err;
            if (err instanceof Error && err.stack)
                return `${err}\n\nStack trace: ${err.stack}`;
            return `${err}`;
        }
        finally {
            this.afterEachHook();
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
exports.Property = Property;
Property.dummyHook = () => { };
