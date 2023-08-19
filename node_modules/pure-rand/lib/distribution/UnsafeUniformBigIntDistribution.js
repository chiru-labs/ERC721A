"use strict";
exports.__esModule = true;
exports.unsafeUniformBigIntDistribution = void 0;
function unsafeUniformBigIntDistribution(from, to, rng) {
    var diff = to - from + BigInt(1);
    var MinRng = BigInt(rng.min());
    var NumValues = BigInt(rng.max() - rng.min() + 1);
    var FinalNumValues = NumValues;
    var NumIterations = BigInt(1);
    while (FinalNumValues < diff) {
        FinalNumValues *= NumValues;
        ++NumIterations;
    }
    var MaxAcceptedRandom = FinalNumValues - (FinalNumValues % diff);
    while (true) {
        var value = BigInt(0);
        for (var num = BigInt(0); num !== NumIterations; ++num) {
            var out = rng.unsafeNext();
            value = NumValues * value + (BigInt(out) - MinRng);
        }
        if (value < MaxAcceptedRandom) {
            var inDiff = value % diff;
            return inDiff + from;
        }
    }
}
exports.unsafeUniformBigIntDistribution = unsafeUniformBigIntDistribution;
