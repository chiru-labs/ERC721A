"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInterfaceAdapter = void 0;
const web3_1 = require("./web3");
const getNetworkTypeClass = (networkType = "ethereum") => {
    const supportedEvmNetworks = ["ethereum", "fabric-evm", "quorum"];
    if (supportedEvmNetworks.includes(networkType))
        return "evm-like";
    return networkType;
};
const createInterfaceAdapter = (options) => {
    const { networkType } = options;
    switch (getNetworkTypeClass(networkType)) {
        case "evm-like": {
            const { provider } = options;
            return new web3_1.Web3InterfaceAdapter({
                networkType: networkType,
                provider: provider
            });
        }
        default:
            throw Error(`Sorry, "${networkType}" is not supported at this time.`);
    }
};
exports.createInterfaceAdapter = createInterfaceAdapter;
//# sourceMappingURL=index.js.map