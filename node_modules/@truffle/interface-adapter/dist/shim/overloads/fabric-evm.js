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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FabricEvmDefinition = void 0;
exports.FabricEvmDefinition = {
    initNetworkType(web3) {
        return __awaiter(this, void 0, void 0, function* () {
            // web3 expects getId to return a hexString convertible to a number
            // for fabric-evm we ignore the hexToNumber output formatter
            overrides.getId(web3);
        });
    }
};
const overrides = {
    // The ts-ignores are ignoring the checks that are
    // saying that web3.eth.net.getId is a function and doesn't
    // have a `method` property, which it does
    getId: (web3) => {
        // @ts-ignore
        const _oldGetIdFormatter = web3.eth.net.getId.method.outputFormatter;
        // @ts-ignore
        web3.eth.net.getId.method.outputFormatter = (networkId) => {
            // chaincode-fabric-evm currently returns a "fabric-evm" string
            // instead of a hex networkID. Instead of trying to decode the hexToNumber,
            // let's just accept `fabric-evm` as a valid networkID for now.
            return networkId;
        };
    }
};
//# sourceMappingURL=fabric-evm.js.map