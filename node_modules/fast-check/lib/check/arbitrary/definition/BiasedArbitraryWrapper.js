"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.biasWrapper = void 0;
const Arbitrary_1 = require("./Arbitrary");
class BiasedArbitraryWrapper extends Arbitrary_1.Arbitrary {
    constructor(freq, arb, biasedArbBuilder) {
        super();
        this.freq = freq;
        this.arb = arb;
        this.biasedArbBuilder = biasedArbBuilder;
    }
    generate(mrng) {
        return mrng.nextInt(1, this.freq) === 1 ? this.biasedArbBuilder(this.arb).generate(mrng) : this.arb.generate(mrng);
    }
}
function biasWrapper(freq, arb, biasedArbBuilder) {
    return new BiasedArbitraryWrapper(freq, arb, biasedArbBuilder);
}
exports.biasWrapper = biasWrapper;
