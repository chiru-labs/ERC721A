const { web3 } = require('./setup');
const { promisify } = require('util');

const makeSnapshot = () =>
  promisify(web3.currentProvider.send.bind(web3.currentProvider))({
    jsonrpc: '2.0',
    method: 'evm_snapshot',
    id: new Date().getTime(),
  }).then(d => d.result);

/**
 * Returns a snapshot object with the 'restore' function, which reverts blockchain to the captured state
 */
const snapshot = async function () {
  let snapshotId = await makeSnapshot();

  return {
    restore: async function () {
      await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
        jsonrpc: '2.0',
        method: 'evm_revert',
        params: [snapshotId],
        id: new Date().getTime(),
      });
      snapshotId = await makeSnapshot();
    },
  };
};

module.exports = snapshot;
