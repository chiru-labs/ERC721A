import { Arbitrary } from './Arbitrary.js';
class BiasedArbitraryWrapper extends Arbitrary {
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
export function biasWrapper(freq, arb, biasedArbBuilder) {
    return new BiasedArbitraryWrapper(freq, arb, biasedArbBuilder);
}
