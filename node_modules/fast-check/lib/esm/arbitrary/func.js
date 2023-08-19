import { hash } from '../utils/hash.js';
import { asyncStringify, asyncToStringMethod, stringify, toStringMethod } from '../utils/stringify.js';
import { cloneMethod, hasCloneMethod } from '../check/symbols.js';
import { array } from './array.js';
import { integer } from './integer.js';
import { tuple } from './tuple.js';
import { escapeForMultilineComments } from './_internals/helpers/TextEscaper.js';
export function func(arb) {
    return tuple(array(arb, { minLength: 1 }), integer().noShrink()).map(([outs, seed]) => {
        const producer = () => {
            const recorded = {};
            const f = (...args) => {
                const repr = stringify(args);
                const val = outs[hash(`${seed}${repr}`) % outs.length];
                recorded[repr] = val;
                return hasCloneMethod(val) ? val[cloneMethod]() : val;
            };
            function prettyPrint(stringifiedOuts) {
                const seenValues = Object.keys(recorded)
                    .sort()
                    .map((k) => `${k} => ${stringify(recorded[k])}`)
                    .map((line) => `/* ${escapeForMultilineComments(line)} */`);
                return `function(...args) {
  // With hash and stringify coming from fast-check${seenValues.length !== 0 ? `\n  ${seenValues.join('\n  ')}` : ''}
  const outs = ${stringifiedOuts};
  return outs[hash('${seed}' + stringify(args)) % outs.length];
}`;
            }
            return Object.defineProperties(f, {
                toString: { value: () => prettyPrint(stringify(outs)) },
                [toStringMethod]: { value: () => prettyPrint(stringify(outs)) },
                [asyncToStringMethod]: { value: async () => prettyPrint(await asyncStringify(outs)) },
                [cloneMethod]: { value: producer, configurable: true },
            });
        };
        return producer();
    });
}
