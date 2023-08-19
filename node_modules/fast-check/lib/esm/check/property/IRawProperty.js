export const runIdToFrequency = (runId) => 2 + Math.floor(Math.log(runId + 1) / Math.log(10));
