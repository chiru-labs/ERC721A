import { skipN } from 'pure-rand';
import { Random } from '../../random/generator/Random.js';
import { convertToRandomGenerator } from '../../random/generator/PureRandom.js';
import { NextValue } from '../arbitrary/definition/NextValue.js';
function lazyGenerate(generator, rng, idx) {
    return () => generator.generate(new Random(rng), idx);
}
export function* toss(generator, seed, random, examples) {
    yield* examples.map((e) => () => new NextValue(e, undefined));
    let idx = 0;
    let rng = convertToRandomGenerator(random(seed));
    for (;;) {
        rng = rng.jump ? rng.jump() : skipN(rng, 42);
        yield lazyGenerate(generator, rng, idx++);
    }
}
