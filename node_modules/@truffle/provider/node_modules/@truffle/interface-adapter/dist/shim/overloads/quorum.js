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
exports.QuorumDefinition = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const abi_coder_1 = require("ethers/utils/abi-coder");
exports.QuorumDefinition = {
    initNetworkType(web3) {
        return __awaiter(this, void 0, void 0, function* () {
            // duck punch some of web3's output formatters
            overrides.getBlock(web3);
            overrides.getTransaction(web3);
            overrides.getTransactionReceipt(web3);
            overrides.decodeParameters(web3);
        });
    }
};
const overrides = {
    // The ts-ignores are ignoring the checks that are
    // saying that web3.eth.getBlock is a function and doesn't
    // have a `method` property, which it does
    getBlock: (web3) => {
        // @ts-ignore
        const _oldBlockFormatter = web3.eth.getBlock.method.outputFormatter;
        // @ts-ignore
        web3.eth.getBlock.method.outputFormatter = (block) => {
            const _oldTimestamp = block.timestamp;
            const _oldGasLimit = block.gasLimit;
            const _oldGasUsed = block.gasUsed;
            // Quorum uses nanoseconds instead of seconds in timestamp
            let timestamp = new bn_js_1.default(block.timestamp.slice(2), 16);
            timestamp = timestamp.div(new bn_js_1.default(10).pow(new bn_js_1.default(9)));
            block.timestamp = "0x" + timestamp.toString(16);
            // Since we're overwriting the gasLimit/Used later,
            // it doesn't matter what it is before the call
            // The same applies to the timestamp, but I reduced
            // the precision since there was an accurate representation
            // We do this because Quorum can have large block/transaction
            // gas limits
            block.gasLimit = "0x0";
            block.gasUsed = "0x0";
            // @ts-ignore
            let result = _oldBlockFormatter.call(web3.eth.getBlock.method, block);
            // Perhaps there is a better method of doing this,
            // but the raw hexstrings work for the time being
            result.timestamp = _oldTimestamp;
            result.gasLimit = _oldGasLimit;
            result.gasUsed = _oldGasUsed;
            return result;
        };
    },
    getTransaction: (web3) => {
        const _oldTransactionFormatter = 
        // @ts-ignore
        web3.eth.getTransaction.method.outputFormatter;
        // @ts-ignore
        web3.eth.getTransaction.method.outputFormatter = (tx) => {
            const _oldGas = tx.gas;
            tx.gas = "0x0";
            let result = _oldTransactionFormatter.call(
            // @ts-ignore
            web3.eth.getTransaction.method, tx);
            // Perhaps there is a better method of doing this,
            // but the raw hexstrings work for the time being
            result.gas = _oldGas;
            return result;
        };
    },
    getTransactionReceipt: (web3) => {
        const _oldTransactionReceiptFormatter = 
        // @ts-ignore
        web3.eth.getTransactionReceipt.method.outputFormatter;
        // @ts-ignore
        web3.eth.getTransactionReceipt.method.outputFormatter = (receipt) => {
            const _oldGasUsed = receipt.gasUsed;
            receipt.gasUsed = "0x0";
            let result = _oldTransactionReceiptFormatter.call(
            // @ts-ignore
            web3.eth.getTransactionReceipt.method, receipt);
            // Perhaps there is a better method of doing this,
            // but the raw hexstrings work for the time being
            result.gasUsed = _oldGasUsed;
            return result;
        };
    },
    // The primary difference between this decodeParameters function and web3's
    // is that the 'Out of Gas?' zero/null bytes guard has been removed and any
    // falsy bytes are interpreted as a zero value.
    decodeParameters: (web3) => {
        const _oldDecodeParameters = web3.eth.abi.decodeParameters;
        const ethersAbiCoder = new abi_coder_1.AbiCoder((type, value) => {
            if (type.match(/^u?int/) &&
                !Array.isArray(value) &&
                (typeof value !== "object" || value.constructor.name !== "BN")) {
                return value.toString();
            }
            return value;
        });
        // result method
        function Result() { }
        web3.eth.abi.decodeParameters = (outputs, bytes) => {
            // if bytes is falsy, we'll pass 64 '0' bits to the ethers.js decoder.
            // the decoder will decode the 64 '0' bits as a 0 value.
            if (!bytes)
                bytes = "0".repeat(64);
            const res = ethersAbiCoder.decode(
            //@ts-ignore 'mapTypes' not existing on type 'ABI'
            web3.eth.abi.mapTypes(outputs), `0x${bytes.replace(/0x/i, "")}`);
            //@ts-ignore complaint regarding Result method
            const returnValue = new Result();
            returnValue.__length__ = 0;
            outputs.forEach((output, i) => {
                let decodedValue = res[returnValue.__length__];
                decodedValue = decodedValue === "0x" ? null : decodedValue;
                returnValue[i] = decodedValue;
                // @ts-ignore object not having name key
                if (typeof output === "object" && output.name) {
                    // @ts-ignore object not having name key
                    returnValue[output.name] = decodedValue;
                }
                returnValue.__length__++;
            });
            return returnValue;
        };
    }
};
//# sourceMappingURL=quorum.js.map