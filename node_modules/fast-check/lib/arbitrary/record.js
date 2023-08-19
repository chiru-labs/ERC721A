"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.record = void 0;
const PartialRecordArbitraryBuilder_1 = require("./_internals/builders/PartialRecordArbitraryBuilder");
function record(recordModel, constraints) {
    if (constraints == null) {
        return (0, PartialRecordArbitraryBuilder_1.buildPartialRecordArbitrary)(recordModel, undefined);
    }
    if ('withDeletedKeys' in constraints && 'requiredKeys' in constraints) {
        throw new Error(`requiredKeys and withDeletedKeys cannot be used together in fc.record`);
    }
    const requireDeletedKeys = ('requiredKeys' in constraints && constraints.requiredKeys !== undefined) ||
        ('withDeletedKeys' in constraints && !!constraints.withDeletedKeys);
    if (!requireDeletedKeys) {
        return (0, PartialRecordArbitraryBuilder_1.buildPartialRecordArbitrary)(recordModel, undefined);
    }
    const requiredKeys = ('requiredKeys' in constraints ? constraints.requiredKeys : undefined) || [];
    for (let idx = 0; idx !== requiredKeys.length; ++idx) {
        const descriptor = Object.getOwnPropertyDescriptor(recordModel, requiredKeys[idx]);
        if (descriptor === undefined) {
            throw new Error(`requiredKeys cannot reference keys that have not been defined in recordModel`);
        }
        if (!descriptor.enumerable) {
            throw new Error(`requiredKeys cannot reference keys that have are enumerable in recordModel`);
        }
    }
    return (0, PartialRecordArbitraryBuilder_1.buildPartialRecordArbitrary)(recordModel, requiredKeys);
}
exports.record = record;
