"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toss = void 0;
const pure_rand_1 = require("pure-rand");
const Random_1 = require("../../random/generator/Random");
const PureRandom_1 = require("../../random/generator/PureRandom");
const NextValue_1 = require("../arbitrary/definition/NextValue");
function lazyGenerate(generator, rng, idx) {
    return () => generator.generate(new Random_1.Random(rng), idx);
}
function* toss(generator, seed, random, examples) {
    yield* examples.map((e) => () => new NextValue_1.NextValue(e, undefined));
    let idx = 0;
    let rng = (0, PureRandom_1.convertToRandomGenerator)(random(seed));
    for (;;) {
        rng = rng.jump ? rng.jump() : (0, pure_rand_1.skipN)(rng, 42);
        yield lazyGenerate(generator, rng, idx++);
    }
}
exports.toss = toss;
