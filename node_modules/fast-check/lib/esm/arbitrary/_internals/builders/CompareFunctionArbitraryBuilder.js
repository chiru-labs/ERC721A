import { escapeForMultilineComments } from '../helpers/TextEscaper.js';
import { cloneMethod } from '../../../check/symbols.js';
import { hash } from '../../../utils/hash.js';
import { stringify } from '../../../utils/stringify.js';
import { integer } from '../../integer.js';
import { tuple } from '../../tuple.js';
export function buildCompareFunctionArbitrary(cmp) {
    return tuple(integer().noShrink(), integer(1, 0xffffffff).noShrink()).map(([seed, hashEnvSize]) => {
        const producer = () => {
            const recorded = {};
            const f = (a, b) => {
                const reprA = stringify(a);
                const reprB = stringify(b);
                const hA = hash(`${seed}${reprA}`) % hashEnvSize;
                const hB = hash(`${seed}${reprB}`) % hashEnvSize;
                const val = cmp(hA, hB);
                recorded[`[${reprA},${reprB}]`] = val;
                return val;
            };
            return Object.assign(f, {
                toString: () => {
                    const seenValues = Object.keys(recorded)
                        .sort()
                        .map((k) => `${k} => ${stringify(recorded[k])}`)
                        .map((line) => `/* ${escapeForMultilineComments(line)} */`);
                    return `function(a, b) {
  // With hash and stringify coming from fast-check${seenValues.length !== 0 ? `\n  ${seenValues.join('\n  ')}` : ''}
  const cmp = ${cmp};
  const hA = hash('${seed}' + stringify(a)) % ${hashEnvSize};
  const hB = hash('${seed}' + stringify(b)) % ${hashEnvSize};
  return cmp(hA, hB);
}`;
                },
                [cloneMethod]: producer,
            });
        };
        return producer();
    });
}
