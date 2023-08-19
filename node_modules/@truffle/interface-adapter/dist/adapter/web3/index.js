"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3InterfaceAdapter = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const shim_1 = require("../../shim");
class Web3InterfaceAdapter {
    constructor({ provider, networkType } = {}) {
        this.web3 = new shim_1.Web3Shim({ provider, networkType });
    }
    getNetworkId() {
        return this.web3.eth.net.getId();
    }
    getBlock(block) {
        return this.web3.eth.getBlock(block);
    }
    getTransaction(tx) {
        return this.web3.eth.getTransaction(tx);
    }
    getTransactionReceipt(tx) {
        return this.web3.eth.getTransactionReceipt(tx);
    }
    getBalance(address) {
        return this.web3.eth.getBalance(address);
    }
    getCode(address) {
        return this.web3.eth.getCode(address);
    }
    getAccounts() {
        return this.web3.eth.getAccounts();
    }
    estimateGas(transactionConfig, stacktrace = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // web3 does not error gracefully when gas estimation fails due to a revert,
            // so in cases where we want to get past this (debugging/stacktracing), we must
            // catch the error and return null instead
            if (stacktrace === true) {
                try {
                    const gasEstimate = yield this.web3.eth.estimateGas(transactionConfig);
                    return gasEstimate;
                }
                catch (_a) {
                    return null;
                }
            }
            else {
                return this.web3.eth.estimateGas(transactionConfig);
            }
        });
    }
    getBlockNumber() {
        return this.web3.eth.getBlockNumber();
    }
    getTransactionCostReport(receipt) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.getTransaction(receipt.transactionHash);
            const block = yield this.getBlock(receipt.blockNumber);
            if (!block)
                return null;
            const balance = yield this.getBalance(tx.from);
            const gasPrice = new bn_js_1.default(tx.gasPrice);
            const gas = new bn_js_1.default(receipt.gasUsed);
            const value = new bn_js_1.default(tx.value);
            const cost = gasPrice.mul(gas).add(value);
            return {
                timestamp: block.timestamp,
                from: tx.from,
                balance: shim_1.Web3Shim.utils.fromWei(balance, "ether"),
                gasUnit: "gwei",
                gasPrice: shim_1.Web3Shim.utils.fromWei(gasPrice, "gwei"),
                gas,
                valueUnit: "ETH",
                value: shim_1.Web3Shim.utils.fromWei(value, "ether"),
                cost
            };
        });
    }
    displayCost(value) {
        return shim_1.Web3Shim.utils.fromWei(value, "ether");
    }
}
exports.Web3InterfaceAdapter = Web3InterfaceAdapter;
//# sourceMappingURL=index.js.map