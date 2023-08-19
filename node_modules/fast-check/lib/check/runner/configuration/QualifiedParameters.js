"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualifiedParameters = void 0;
const pure_rand_1 = require("pure-rand");
const VerbosityLevel_1 = require("./VerbosityLevel");
class QualifiedParameters {
    constructor(op) {
        const p = op || {};
        this.seed = QualifiedParameters.readSeed(p);
        this.randomType = QualifiedParameters.readRandomType(p);
        this.numRuns = QualifiedParameters.readNumRuns(p);
        this.verbose = QualifiedParameters.readVerbose(p);
        this.maxSkipsPerRun = QualifiedParameters.readOrDefault(p, 'maxSkipsPerRun', 100);
        this.timeout = QualifiedParameters.readOrDefault(p, 'timeout', null);
        this.skipAllAfterTimeLimit = QualifiedParameters.readOrDefault(p, 'skipAllAfterTimeLimit', null);
        this.interruptAfterTimeLimit = QualifiedParameters.readOrDefault(p, 'interruptAfterTimeLimit', null);
        this.markInterruptAsFailure = QualifiedParameters.readBoolean(p, 'markInterruptAsFailure');
        this.skipEqualValues = QualifiedParameters.readBoolean(p, 'skipEqualValues');
        this.ignoreEqualValues = QualifiedParameters.readBoolean(p, 'ignoreEqualValues');
        this.logger = QualifiedParameters.readOrDefault(p, 'logger', (v) => {
            console.log(v);
        });
        this.path = QualifiedParameters.readOrDefault(p, 'path', '');
        this.unbiased = QualifiedParameters.readBoolean(p, 'unbiased');
        this.examples = QualifiedParameters.readOrDefault(p, 'examples', []);
        this.endOnFailure = QualifiedParameters.readBoolean(p, 'endOnFailure');
        this.reporter = QualifiedParameters.readOrDefault(p, 'reporter', null);
        this.asyncReporter = QualifiedParameters.readOrDefault(p, 'asyncReporter', null);
    }
    toParameters() {
        const orUndefined = (value) => (value !== null ? value : undefined);
        return {
            seed: this.seed,
            randomType: this.randomType,
            numRuns: this.numRuns,
            maxSkipsPerRun: this.maxSkipsPerRun,
            timeout: orUndefined(this.timeout),
            skipAllAfterTimeLimit: orUndefined(this.skipAllAfterTimeLimit),
            interruptAfterTimeLimit: orUndefined(this.interruptAfterTimeLimit),
            markInterruptAsFailure: this.markInterruptAsFailure,
            skipEqualValues: this.skipEqualValues,
            ignoreEqualValues: this.ignoreEqualValues,
            path: this.path,
            logger: this.logger,
            unbiased: this.unbiased,
            verbose: this.verbose,
            examples: this.examples,
            endOnFailure: this.endOnFailure,
            reporter: orUndefined(this.reporter),
            asyncReporter: orUndefined(this.asyncReporter),
        };
    }
    static read(op) {
        return new QualifiedParameters(op);
    }
}
exports.QualifiedParameters = QualifiedParameters;
QualifiedParameters.readSeed = (p) => {
    if (p.seed == null)
        return Date.now() ^ (Math.random() * 0x100000000);
    const seed32 = p.seed | 0;
    if (p.seed === seed32)
        return seed32;
    const gap = p.seed - seed32;
    return seed32 ^ (gap * 0x100000000);
};
QualifiedParameters.readRandomType = (p) => {
    if (p.randomType == null)
        return pure_rand_1.default.xorshift128plus;
    if (typeof p.randomType === 'string') {
        switch (p.randomType) {
            case 'mersenne':
                return pure_rand_1.default.mersenne;
            case 'congruential':
                return pure_rand_1.default.congruential;
            case 'congruential32':
                return pure_rand_1.default.congruential32;
            case 'xorshift128plus':
                return pure_rand_1.default.xorshift128plus;
            case 'xoroshiro128plus':
                return pure_rand_1.default.xoroshiro128plus;
            default:
                throw new Error(`Invalid random specified: '${p.randomType}'`);
        }
    }
    return p.randomType;
};
QualifiedParameters.readNumRuns = (p) => {
    const defaultValue = 100;
    if (p.numRuns != null)
        return p.numRuns;
    if (p.num_runs != null)
        return p.num_runs;
    return defaultValue;
};
QualifiedParameters.readVerbose = (p) => {
    if (p.verbose == null)
        return VerbosityLevel_1.VerbosityLevel.None;
    if (typeof p.verbose === 'boolean') {
        return p.verbose === true ? VerbosityLevel_1.VerbosityLevel.Verbose : VerbosityLevel_1.VerbosityLevel.None;
    }
    if (p.verbose <= VerbosityLevel_1.VerbosityLevel.None) {
        return VerbosityLevel_1.VerbosityLevel.None;
    }
    if (p.verbose >= VerbosityLevel_1.VerbosityLevel.VeryVerbose) {
        return VerbosityLevel_1.VerbosityLevel.VeryVerbose;
    }
    return p.verbose | 0;
};
QualifiedParameters.readBoolean = (p, key) => p[key] === true;
QualifiedParameters.readOrDefault = (p, key, defaultValue) => {
    const value = p[key];
    return value != null ? value : defaultValue;
};
