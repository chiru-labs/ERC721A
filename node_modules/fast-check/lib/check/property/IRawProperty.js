"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runIdToFrequency = void 0;
const runIdToFrequency = (runId) => 2 + Math.floor(Math.log(runId + 1) / Math.log(10));
exports.runIdToFrequency = runIdToFrequency;
