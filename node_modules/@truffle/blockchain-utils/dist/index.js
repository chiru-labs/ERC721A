"use strict";
const Blockchain = {
    getBlockByNumber(blockNumber, provider, callback) {
        const params = [blockNumber, true];
        provider.send({
            jsonrpc: "2.0",
            method: "eth_getBlockByNumber",
            params,
            id: Date.now()
        }, callback);
    },
    getBlockByHash(blockHash, provider, callback) {
        const params = [blockHash, true];
        provider.send({
            jsonrpc: "2.0",
            method: "eth_getBlockByHash",
            params,
            id: Date.now()
        }, callback);
    },
    parse(uri) {
        const parsed = {};
        if (uri.indexOf("blockchain://") !== 0)
            return parsed;
        const cleanUri = uri.replace("blockchain://", "");
        const pieces = cleanUri.split("/block/");
        parsed.genesis_hash = `0x${pieces[0]}`;
        parsed.block_hash = `0x${pieces[1]}`;
        return parsed;
    },
    asURI(provider) {
        return new Promise((resolve, reject) => {
            let genesis, latest;
            this.getBlockByNumber("0x0", provider, (err, { result }) => {
                if (err)
                    return reject(err);
                genesis = result;
                this.getBlockByNumber("latest", provider, (err, { result }) => {
                    if (err)
                        return reject(err);
                    latest = result;
                    const url = `blockchain://${genesis.hash.replace("0x", "")}/block/${latest.hash.replace("0x", "")}`;
                    resolve(url);
                });
            });
        });
    },
    matches(uri, provider) {
        return new Promise((resolve, reject) => {
            const parsedUri = this.parse(uri);
            const expectedGenesis = parsedUri.genesis_hash;
            const expectedBlock = parsedUri.block_hash;
            this.getBlockByNumber("0x0", provider, (err, { result }) => {
                if (err)
                    return reject(err);
                const block = result;
                if (block.hash !== expectedGenesis)
                    return resolve(false);
                this.getBlockByHash(expectedBlock, provider, (err, { result }) => {
                    // Treat an error as if the block didn't exist. This is because
                    // some clients respond differently.
                    const block = result;
                    if (err || block == null) {
                        return resolve(false);
                    }
                    resolve(true);
                });
            });
        });
    }
};
module.exports = Blockchain;
//# sourceMappingURL=index.js.map