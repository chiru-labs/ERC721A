'use strict';

var EventEmitter = require('events').EventEmitter;
var FilterSubprovider = require('./filters.js');
var from = require('../util/rpc-hex-encoding.js');
var inherits = require('util').inherits;
var utils = require('ethereumjs-util');

function SubscriptionSubprovider(opts) {
  var self = this;

  opts = opts || {};

  EventEmitter.apply(this, Array.prototype.slice.call(arguments));
  FilterSubprovider.apply(this, [opts]);

  this.subscriptions = {};
}

inherits(SubscriptionSubprovider, FilterSubprovider);

// a cheap crack at multiple inheritance
// I don't really care if `instanceof EventEmitter` passes...
Object.assign(SubscriptionSubprovider.prototype, EventEmitter.prototype);

// preserve our constructor, though
SubscriptionSubprovider.prototype.constructor = SubscriptionSubprovider;

SubscriptionSubprovider.prototype.eth_subscribe = function (payload, cb) {
  var self = this;
  var createSubscriptionFilter = function createSubscriptionFilter() {};
  var subscriptionType = payload.params[0];

  switch (subscriptionType) {
    case 'logs':
      ;(function () {
        var options = payload.params[1];
        createSubscriptionFilter = self.newLogFilter.bind(self, options);
      })();
      break;
    case 'newPendingTransactions':
      createSubscriptionFilter = self.newPendingTransactionFilter.bind(self);
      break;
    case 'newHeads':
      createSubscriptionFilter = self.newBlockFilter.bind(self);
      break;
    case 'syncing':
    default:
      cb(new Error('unsupported subscription type'));
      return;
  }

  createSubscriptionFilter(function (err, hexId) {
    if (err) return cb(err);

    var id = Number.parseInt(hexId, 16);
    self.subscriptions[id] = subscriptionType;

    self.filters[id].on('data', function (results) {
      if (!Array.isArray(results)) {
        results = [results];
      }

      var notificationHandler = self._notificationHandler.bind(self, hexId, subscriptionType);
      results.forEach(notificationHandler);
      self.filters[id].clearChanges();
    });
    if (subscriptionType === 'newPendingTransactions') {
      self.checkForPendingBlocks();
    }
    cb(null, hexId);
  });
};

SubscriptionSubprovider.prototype.eth_unsubscribe = function (payload, cb) {
  var self = this;
  var hexId = payload.params[0];
  var id = Number.parseInt(hexId, 16);
  if (!self.subscriptions[id]) {
    cb(new Error('Subscription ID ' + hexId + ' not found.'));
  } else {
    var subscriptionType = self.subscriptions[id];
    self.uninstallFilter(hexId, function (err, result) {
      delete self.subscriptions[id];
      cb(err, result);
    });
  }
};

SubscriptionSubprovider.prototype._notificationHandler = function (hexId, subscriptionType, result) {
  var self = this;
  if (subscriptionType === 'newHeads') {
    result = self._notificationResultFromBlock(result);
  }

  // it seems that web3 doesn't expect there to be a separate error event
  // so we must emit null along with the result object
  self.emit('data', null, {
    jsonrpc: "2.0",
    method: "eth_subscription",
    params: {
      subscription: hexId,
      result: result
    }
  });
};

SubscriptionSubprovider.prototype._notificationResultFromBlock = function (block) {
  return {
    hash: utils.bufferToHex(block.hash),
    parentHash: utils.bufferToHex(block.parentHash),
    sha3Uncles: utils.bufferToHex(block.sha3Uncles),
    miner: utils.bufferToHex(block.miner),
    stateRoot: utils.bufferToHex(block.stateRoot),
    transactionsRoot: utils.bufferToHex(block.transactionsRoot),
    receiptsRoot: utils.bufferToHex(block.receiptsRoot),
    logsBloom: utils.bufferToHex(block.logsBloom),
    difficulty: from.bufferToQuantityHex(block.difficulty),
    number: from.bufferToQuantityHex(block.number),
    gasLimit: from.bufferToQuantityHex(block.gasLimit),
    gasUsed: from.bufferToQuantityHex(block.gasUsed),
    nonce: block.nonce ? utils.bufferToHex(block.nonce) : null,
    mixHash: utils.bufferToHex(block.mixHash),
    timestamp: from.bufferToQuantityHex(block.timestamp),
    extraData: utils.bufferToHex(block.extraData)
  };
};

SubscriptionSubprovider.prototype.handleRequest = function (payload, next, end) {
  switch (payload.method) {
    case 'eth_subscribe':
      this.eth_subscribe(payload, end);
      break;
    case 'eth_unsubscribe':
      this.eth_unsubscribe(payload, end);
      break;
    default:
      FilterSubprovider.prototype.handleRequest.apply(this, Array.prototype.slice.call(arguments));
  }
};

module.exports = SubscriptionSubprovider;