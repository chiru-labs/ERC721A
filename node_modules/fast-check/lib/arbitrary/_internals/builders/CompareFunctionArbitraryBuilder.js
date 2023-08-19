"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCompareFunctionArbitrary = void 0;
const TextEscaper_1 = require("../helpers/TextEscaper");
const symbols_1 = require("../../../check/symbols");
const hash_1 = require("../../../utils/hash");
const stringify_1 = require("../../../utils/stringify");
const integer_1 = require("../../integer");
const tuple_1 = require("../../tuple");
function buildCompareFunctionArbitrary(cmp) {
    return (0, tuple_1.tuple)((0, integer_1.integer)().noShrink(), (0, integer_1.integer)(1, 0xffffffff).noShrink()).map(([seed, hashEnvSize]) => {
        const producer = () => {
            const recorded = {};
            const f = (a, b) => {
                const reprA = (0, stringify_1.stringify)(a);
                const reprB = (0, stringify_1.stringify)(b);
                const hA = (0, hash_1.hash)(`${seed}${reprA}`) % hashEnvSize;
                const hB = (0, hash_1.hash)(`${seed}${reprB}`) % hashEnvSize;
                const val = cmp(hA, hB);
                recorded[`[${reprA},${reprB}]`] = val;
                return val;
            };
            return Object.assign(f, {
                toString: () => {
                    const seenValues = Object.keys(recorded)
                        .sort()
                        .map((k) => `${k} => ${(0, stringify_1.stringify)(recorded[k])}`)
                        .map((line) => `/* ${(0, TextEscaper_1.escapeForMultilineComments)(line)} */`);
                    return `function(a, b) {
  // With hash and stringify coming from fast-check${seenValues.length !== 0 ? `\n  ${seenValues.join('\n  ')}` : ''}
  const cmp = ${cmp};
  const hA = hash('${seed}' + stringify(a)) % ${hashEnvSize};
  const hB = hash('${seed}' + stringify(b)) % ${hashEnvSize};
  return cmp(hA, hB);
}`;
                },
                [symbols_1.cloneMethod]: producer,
            });
        };
        return producer();
    });
}
exports.buildCompareFunctionArbitrary = buildCompareFunctionArbitrary;
