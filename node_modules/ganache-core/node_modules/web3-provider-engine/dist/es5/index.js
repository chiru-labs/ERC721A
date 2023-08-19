'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var ethUtil = require('ethereumjs-util');
var EthBlockTracker = require('eth-block-tracker');
var map = require('async/map');
var eachSeries = require('async/eachSeries');
var Stoplight = require('./util/stoplight.js');
var cacheUtils = require('./util/rpc-cache-utils.js');
var createPayload = require('./util/create-payload.js');
var noop = function noop() {};

module.exports = Web3ProviderEngine;

inherits(Web3ProviderEngine, EventEmitter);

function Web3ProviderEngine(opts) {
  var self = this;
  EventEmitter.call(self);
  self.setMaxListeners(30);
  // parse options
  opts = opts || {};

  // block polling
  var directProvider = { sendAsync: self._handleAsync.bind(self) };
  var blockTrackerProvider = opts.blockTrackerProvider || directProvider;
  self._blockTracker = opts.blockTracker || new EthBlockTracker({
    provider: blockTrackerProvider,
    pollingInterval: opts.pollingInterval || 4000
  });

  // handle new block
  self._blockTracker.on('block', function (jsonBlock) {
    var bufferBlock = toBufferBlock(jsonBlock);
    self._setCurrentBlock(bufferBlock);
  });

  // emit block events from the block tracker
  self._blockTracker.on('block', self.emit.bind(self, 'rawBlock'));
  self._blockTracker.on('sync', self.emit.bind(self, 'sync'));
  self._blockTracker.on('latest', self.emit.bind(self, 'latest'));

  // set initialization blocker
  self._ready = new Stoplight();
  // unblock initialization after first block
  self._blockTracker.once('block', function () {
    self._ready.go();
  });
  // local state
  self.currentBlock = null;
  self._providers = [];
}

// public

Web3ProviderEngine.prototype.start = function () {
  var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;

  var self = this;
  // start block polling
  self._blockTracker.start().then(cb).catch(cb);
  self._running = true;
  self.emit('start');
};

Web3ProviderEngine.prototype.stop = function () {
  var self = this;
  // stop block polling
  self._blockTracker.stop();
  self._running = false;
  self.emit('stop');
};

Web3ProviderEngine.prototype.isRunning = function () {
  var self = this;
  return self._running;
};

Web3ProviderEngine.prototype.addProvider = function (source, index) {
  var self = this;
  if (typeof index === 'number') {
    self._providers.splice(index, 0, source);
  } else {
    self._providers.push(source);
  }
  source.setEngine(this);
};

Web3ProviderEngine.prototype.removeProvider = function (source) {
  var self = this;
  var index = self._providers.indexOf(source);
  if (index < 0) throw new Error('Provider not found.');
  self._providers.splice(index, 1);
};

Web3ProviderEngine.prototype.send = function (payload) {
  throw new Error('Web3ProviderEngine does not support synchronous requests.');
};

Web3ProviderEngine.prototype.sendAsync = function (payload, cb) {
  var self = this;
  self._ready.await(function () {

    if (Array.isArray(payload)) {
      // handle batch
      map(payload, self._handleAsync.bind(self), cb);
    } else {
      // handle single
      self._handleAsync(payload, cb);
    }
  });
};

// private

Web3ProviderEngine.prototype._handleAsync = function (payload, finished) {
  var self = this;
  var currentProvider = -1;
  var result = null;
  var error = null;

  var stack = [];

  next();

  function next(after) {
    currentProvider += 1;
    stack.unshift(after);

    // Bubbled down as far as we could go, and the request wasn't
    // handled. Return an error.
    if (currentProvider >= self._providers.length) {
      end(new Error('Request for method "' + payload.method + '" not handled by any subprovider. Please check your subprovider configuration to ensure this method is handled.'));
    } else {
      try {
        var provider = self._providers[currentProvider];
        provider.handleRequest(payload, next, end);
      } catch (e) {
        end(e);
      }
    }
  }

  function end(_error, _result) {
    error = _error;
    result = _result;

    eachSeries(stack, function (fn, callback) {

      if (fn) {
        fn(error, result, callback);
      } else {
        callback();
      }
    }, function () {
      // console.log('COMPLETED:', payload)
      // console.log('RESULT: ', result)

      var resultObj = {
        id: payload.id,
        jsonrpc: payload.jsonrpc,
        result: result
      };

      if (error != null) {
        resultObj.error = {
          message: error.stack || error.message || error,
          code: -32000
          // respond with both error formats
        };finished(error, resultObj);
      } else {
        finished(null, resultObj);
      }
    });
  }
};

//
// from remote-data
//

Web3ProviderEngine.prototype._setCurrentBlock = function (block) {
  var self = this;
  self.currentBlock = block;
  self.emit('block', block);
};

// util

function toBufferBlock(jsonBlock) {
  return {
    number: ethUtil.toBuffer(jsonBlock.number),
    hash: ethUtil.toBuffer(jsonBlock.hash),
    parentHash: ethUtil.toBuffer(jsonBlock.parentHash),
    nonce: ethUtil.toBuffer(jsonBlock.nonce),
    mixHash: ethUtil.toBuffer(jsonBlock.mixHash),
    sha3Uncles: ethUtil.toBuffer(jsonBlock.sha3Uncles),
    logsBloom: ethUtil.toBuffer(jsonBlock.logsBloom),
    transactionsRoot: ethUtil.toBuffer(jsonBlock.transactionsRoot),
    stateRoot: ethUtil.toBuffer(jsonBlock.stateRoot),
    receiptsRoot: ethUtil.toBuffer(jsonBlock.receiptRoot || jsonBlock.receiptsRoot),
    miner: ethUtil.toBuffer(jsonBlock.miner),
    difficulty: ethUtil.toBuffer(jsonBlock.difficulty),
    totalDifficulty: ethUtil.toBuffer(jsonBlock.totalDifficulty),
    size: ethUtil.toBuffer(jsonBlock.size),
    extraData: ethUtil.toBuffer(jsonBlock.extraData),
    gasLimit: ethUtil.toBuffer(jsonBlock.gasLimit),
    gasUsed: ethUtil.toBuffer(jsonBlock.gasUsed),
    timestamp: ethUtil.toBuffer(jsonBlock.timestamp),
    transactions: jsonBlock.transactions
  };
}