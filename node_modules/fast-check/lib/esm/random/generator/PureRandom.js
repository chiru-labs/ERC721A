class ConvertedRandomGenerator {
    constructor(rng) {
        this.rng = rng;
        if (typeof this.rng.jump === 'function') {
            this.jump = function jump() {
                const out = this.jump();
                return new ConvertedRandomGenerator(out);
            };
            this.unsafeJump = function unsafeJump() {
                const out = this.jump();
                this.rng = out;
            };
        }
    }
    min() {
        return this.rng.min();
    }
    max() {
        return this.rng.max();
    }
    clone() {
        return new ConvertedRandomGenerator(this.rng);
    }
    next() {
        const out = this.rng.next();
        return [out[0], new ConvertedRandomGenerator(out[1])];
    }
    unsafeNext() {
        const out = this.rng.next();
        this.rng = out[1];
        return out[0];
    }
}
export function convertToRandomGenerator(rng) {
    if ('clone' in rng && 'unsafeNext' in rng) {
        return rng;
    }
    return new ConvertedRandomGenerator(rng);
}
