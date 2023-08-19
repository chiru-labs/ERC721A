const { web3, BN } = require('./setup');
const { fromWei } = require('web3-utils');

class Tracker {
  constructor (acc, unit) {
    this.account = acc;
    this.unit = unit;
  }
  async delta (unit = this.unit) {
    const { delta } = await this.deltaWithFees(unit);
    return delta;
  }
  async deltaWithFees (unit = this.unit) {
    const current = await balanceCurrent(this.account);
    const delta = current.sub(this.prev);
    this.prev = current;

    const fees = await feesPaid(this.account, this.prevBlock);
    this.prevBlock = await web3.eth.getBlockNumber();

    return {
      delta: new BN(fromWei(delta, unit)),
      fees: new BN(fromWei(fees, unit)),
    };
  }
  async get (unit = this.unit) {
    this.prev = await balanceCurrent(this.account);
    this.prevBlock = await web3.eth.getBlockNumber();
    return new BN(fromWei(this.prev, unit));
  }
}

async function balanceTracker (owner, unit = 'wei') {
  const tracker = new Tracker(owner, unit);
  await tracker.get();
  return tracker;
}

async function balanceCurrent (account, unit = 'wei') {
  return new BN(fromWei(await web3.eth.getBalance(account), unit));
}

async function feesPaid (account, sinceBlock) {
  const currentBlock = await web3.eth.getBlockNumber();
  let gas = new BN('0');

  for (let b = sinceBlock + 1; b <= currentBlock; b += 1) {
    const { transactions } = await web3.eth.getBlock(b);
    for (const tx of transactions) {
      const { from, gasPrice } = await web3.eth.getTransaction(tx);
      if (from === account) {
        const { gasUsed } = await web3.eth.getTransactionReceipt(tx);
        gas = gas.add(new BN(gasPrice).muln(gasUsed));
      }
    }
  }

  return gas;
}

module.exports = {
  current: balanceCurrent,
  tracker: balanceTracker,
};
