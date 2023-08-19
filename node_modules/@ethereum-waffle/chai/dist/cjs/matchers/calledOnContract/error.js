"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderWithHistoryExpected = void 0;
class ProviderWithHistoryExpected extends Error {
    constructor() {
        super('calledOnContract matcher requires provider that support call history');
    }
}
exports.ProviderWithHistoryExpected = ProviderWithHistoryExpected;
