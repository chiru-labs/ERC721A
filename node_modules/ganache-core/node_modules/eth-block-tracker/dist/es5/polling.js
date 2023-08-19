const EthQuery = require('eth-query');
const EventEmitter = require('events');
const pify = require('pify');
const BaseBlockTracker = require('./base');
const timeout = duration => new Promise(resolve => setTimeout(resolve, duration));

const sec = 1000;
const min = 60 * sec;

class PollingBlockTracker extends BaseBlockTracker {

  constructor(opts = {}) {
    // parse + validate args
    if (!opts.provider) throw new Error('PollingBlockTracker - no provider specified.');
    const pollingInterval = opts.pollingInterval || 20 * sec;
    // BaseBlockTracker constructor
    super(Object.assign({
      blockResetDuration: pollingInterval
    }, opts));
    // config
    this._provider = opts.provider;
    this._pollingInterval = pollingInterval;
    // util
    this._query = new EthQuery(this._provider);
  }

  //
  // public
  //

  // trigger block polling
  async checkForLatestBlock() {
    await this._updateLatestBlock();
    return await this.getLatestBlock();
  }

  //
  // private
  //

  _start() {
    this._performSync().catch(err => this.emit('error', err));
  }

  async _performSync() {
    while (this._isRunning) {
      try {
        await this._updateLatestBlock();
      } catch (err) {
        this.emit('error', err);
      }
      await timeout(this._pollingInterval);
    }
  }

  async _updateLatestBlock() {
    // fetch + set latest block
    const latestBlock = await this._fetchLatestBlock();
    this._newPotentialLatest(latestBlock);
  }

  async _fetchLatestBlock() {
    return await pify(this._query.getBlockByNumber).call(this._query, 'latest', false);
  }

}

module.exports = PollingBlockTracker;