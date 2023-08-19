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
exports.EthereumDefinition = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
exports.EthereumDefinition = {
    initNetworkType(web3) {
        return __awaiter(this, void 0, void 0, function* () {
            // truffle has started expecting gas used/limit to be
            // hex strings to support bignumbers for other ledgers
            overrides.getBlock(web3);
            overrides.getTransaction(web3);
            overrides.getTransactionReceipt(web3);
        });
    }
};
const overrides = {
    // The ts-ignores are ignoring the checks that are
    // saying that web3.eth.getBlock is a function and doesn't
    // have a `method` property, which it does
    getBlock: (web3) => {
        // @ts-ignore
        const _oldFormatter = web3.eth.getBlock.method.outputFormatter;
        // @ts-ignore
        web3.eth.getBlock.method.outputFormatter = (block) => {
            // @ts-ignore
            let result = _oldFormatter.call(web3.eth.getBlock.method, block);
            // Perhaps there is a better method of doing this,
            // but the raw hexstrings work for the time being
            result.gasLimit = "0x" + new bn_js_1.default(result.gasLimit).toString(16);
            result.gasUsed = "0x" + new bn_js_1.default(result.gasUsed).toString(16);
            return result;
        };
    },
    getTransaction: (web3) => {
        const _oldTransactionFormatter = 
        // @ts-ignore
        web3.eth.getTransaction.method.outputFormatter;
        // @ts-ignore
        web3.eth.getTransaction.method.outputFormatter = (tx) => {
            let result = _oldTransactionFormatter.call(
            // @ts-ignore
            web3.eth.getTransaction.method, tx);
            // Perhaps there is a better method of doing this,
            // but the raw hexstrings work for the time being
            result.gas = "0x" + new bn_js_1.default(result.gas).toString(16);
            return result;
        };
    },
    getTransactionReceipt: (web3) => {
        const _oldTransactionReceiptFormatter = 
        // @ts-ignore
        web3.eth.getTransactionReceipt.method.outputFormatter;
        // @ts-ignore
        web3.eth.getTransactionReceipt.method.outputFormatter = (receipt) => {
            let result = _oldTransactionReceiptFormatter.call(
            // @ts-ignore
            web3.eth.getTransactionReceipt.method, receipt);
            // Perhaps there is a better method of doing this,
            // but the raw hexstrings work for the time being
            result.gasUsed = "0x" + new bn_js_1.default(result.gasUsed).toString(16);
            return result;
        };
    }
};
//# sourceMappingURL=ethereum.js.map