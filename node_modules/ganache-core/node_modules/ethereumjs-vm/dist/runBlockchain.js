"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require('async');
/**
 * @ignore
 */
function runBlockchain(blockchain) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var self = _this;
        var headBlock;
        var parentState;
        blockchain = blockchain || _this.blockchain;
        // setup blockchain iterator
        blockchain.iterator('vm', processBlock, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
        function processBlock(block, reorg, cb) {
            async.series([getStartingState, runBlock], cb);
            // determine starting state for block run
            function getStartingState(cb) {
                // if we are just starting or if a chain re-org has happened
                if (!headBlock || reorg) {
                    blockchain.getBlock(block.header.parentHash, function (err, parentBlock) {
                        parentState = parentBlock.header.stateRoot;
                        // generate genesis state if we are at the genesis block
                        // we don't have the genesis state
                        if (!headBlock) {
                            return self.stateManager.generateCanonicalGenesis(cb);
                        }
                        else {
                            cb(err);
                        }
                    });
                }
                else {
                    parentState = headBlock.header.stateRoot;
                    cb();
                }
            }
            // run block, update head if valid
            function runBlock(cb) {
                self
                    .runBlock({
                    block: block,
                    root: parentState,
                })
                    .then(function () {
                    // set as new head block
                    headBlock = block;
                    cb();
                })
                    .catch(function (err) {
                    // remove invalid block
                    blockchain.delBlock(block.header.hash(), function () {
                        cb(err);
                    });
                });
            }
        }
    });
}
exports.default = runBlockchain;
//# sourceMappingURL=runBlockchain.js.map