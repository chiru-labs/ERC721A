"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardhatDeployContract = exports.getDeployMockContract = void 0;
const path_1 = __importDefault(require("path"));
function getDeployMockContract() {
    const wafflePath = require.resolve("ethereum-waffle");
    const waffleMockContractPath = path_1.default.dirname(require.resolve("@ethereum-waffle/mock-contract", {
        paths: [wafflePath],
    }));
    const waffleMockContract = require(waffleMockContractPath);
    return waffleMockContract.deployMockContract;
}
exports.getDeployMockContract = getDeployMockContract;
async function hardhatDeployContract(hre, signer, contractJSON, args = [], overrideOptions = {}) {
    const { deployContract } = require("ethereum-waffle/dist/cjs/deployContract");
    if (overrideOptions.gasLimit === undefined &&
        typeof hre.network.config.gas === "number") {
        overrideOptions.gasLimit = hre.network.config.gas;
    }
    return deployContract(signer, contractJSON, args, overrideOptions);
}
exports.hardhatDeployContract = hardhatDeployContract;
//# sourceMappingURL=deploy.js.map