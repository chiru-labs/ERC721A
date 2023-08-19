"use strict";
exports.__esModule = true;
exports.unsafeUniformArrayIntDistribution = void 0;
var ArrayInt_1 = require("./internals/ArrayInt");
var UnsafeUniformArrayIntDistributionInternal_1 = require("./internals/UnsafeUniformArrayIntDistributionInternal");
function unsafeUniformArrayIntDistribution(from, to, rng) {
    var rangeSize = ArrayInt_1.trimArrayIntInplace(ArrayInt_1.addOneToPositiveArrayInt(ArrayInt_1.substractArrayIntToNew(to, from)));
    var emptyArrayIntData = rangeSize.data.slice(0);
    var g = UnsafeUniformArrayIntDistributionInternal_1.unsafeUniformArrayIntDistributionInternal(emptyArrayIntData, rangeSize.data, rng);
    return ArrayInt_1.trimArrayIntInplace(ArrayInt_1.addArrayIntToNew({ sign: 1, data: g }, from));
}
exports.unsafeUniformArrayIntDistribution = unsafeUniformArrayIntDistribution;
