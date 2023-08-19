import { boolean } from '../../boolean.js';
import { constant } from '../../constant.js';
import { double } from '../../double.js';
export function jsonConstraintsBuilder(stringArbitrary, constraints) {
    const { depthFactor = 0.1, maxDepth } = constraints;
    const key = stringArbitrary;
    const values = [
        boolean(),
        double({ next: true, noDefaultInfinity: true, noNaN: true }),
        stringArbitrary,
        constant(null),
    ];
    return { key, values, depthFactor, maxDepth };
}
