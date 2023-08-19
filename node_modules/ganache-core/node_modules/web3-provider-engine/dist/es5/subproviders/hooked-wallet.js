'use strict';

/*
 * Emulate 'eth_accounts' / 'eth_sendTransaction' using 'eth_sendRawTransaction'
 *
 * The two callbacks a user needs to implement are:
 * - getAccounts() -- array of addresses supported
 * - signTransaction(tx) -- sign a raw transaction object
 */

var waterfall = require('async/waterfall');
var parallel = require('async/parallel');
var inherits = require('util').inherits;
var ethUtil = require('ethereumjs-util');
var sigUtil = require('eth-sig-util');
var extend = require('xtend');
var Semaphore = require('semaphore');
var Subprovider = require('./subprovider.js');
var estimateGas = require('../util/estimate-gas.js');
var hexRegex = /^[0-9A-Fa-f]+$/g;

module.exports = HookedWalletSubprovider;

// handles the following RPC methods:
//   eth_coinbase
//   eth_accounts
//   eth_sendTransaction
//   eth_sign
//   eth_signTypedData
//   personal_sign
//   personal_ecRecover
//   parity_postTransaction
//   parity_checkRequest
//   parity_defaultAccount

//
// Tx Signature Flow
//
// handleRequest: eth_sendTransaction
//   validateTransaction (basic validity check)
//     validateSender (checks that sender is in accounts)
//   processTransaction (sign tx and submit to network)
//     approveTransaction (UI approval hook)
//     checkApproval
//     finalizeAndSubmitTx (tx signing)
//       nonceLock.take (bottle neck to ensure atomic nonce)
//         fillInTxExtras (set fallback gasPrice, nonce, etc)
//         signTransaction (perform the signature)
//         publishTransaction (publish signed tx to network)
//


inherits(HookedWalletSubprovider, Subprovider);

function HookedWalletSubprovider(opts) {
  var self = this;
  // control flow
  self.nonceLock = Semaphore(1);

  // data lookup
  if (opts.getAccounts) self.getAccounts = opts.getAccounts;
  // high level override
  if (opts.processTransaction) self.processTransaction = opts.processTransaction;
  if (opts.processMessage) self.processMessage = opts.processMessage;
  if (opts.processPersonalMessage) self.processPersonalMessage = opts.processPersonalMessage;
  if (opts.processTypedMessage) self.processTypedMessage = opts.processTypedMessage;
  // approval hooks
  self.approveTransaction = opts.approveTransaction || self.autoApprove;
  self.approveMessage = opts.approveMessage || self.autoApprove;
  self.approvePersonalMessage = opts.approvePersonalMessage || self.autoApprove;
  self.approveTypedMessage = opts.approveTypedMessage || self.autoApprove;
  // actually perform the signature
  if (opts.signTransaction) self.signTransaction = opts.signTransaction || mustProvideInConstructor('signTransaction');
  if (opts.signMessage) self.signMessage = opts.signMessage || mustProvideInConstructor('signMessage');
  if (opts.signPersonalMessage) self.signPersonalMessage = opts.signPersonalMessage || mustProvideInConstructor('signPersonalMessage');
  if (opts.signTypedMessage) self.signTypedMessage = opts.signTypedMessage || mustProvideInConstructor('signTypedMessage');
  if (opts.recoverPersonalSignature) self.recoverPersonalSignature = opts.recoverPersonalSignature;
  // publish to network
  if (opts.publishTransaction) self.publishTransaction = opts.publishTransaction;
  // gas options
  self.estimateGas = opts.estimateGas || self.estimateGas;
  self.getGasPrice = opts.getGasPrice || self.getGasPrice;
}

HookedWalletSubprovider.prototype.handleRequest = function (payload, next, end) {
  var self = this;
  self._parityRequests = {};
  self._parityRequestCount = 0;

  // switch statement is not block scoped
  // sp we cant repeat var declarations
  var txParams = void 0,
      msgParams = void 0,
      extraParams = void 0;
  var message = void 0,
      address = void 0;

  switch (payload.method) {

    case 'eth_coinbase':
      // process normally
      self.getAccounts(function (err, accounts) {
        if (err) return end(err);
        var result = accounts[0] || null;
        end(null, result);
      });
      return;

    case 'eth_accounts':
      // process normally
      self.getAccounts(function (err, accounts) {
        if (err) return end(err);
        end(null, accounts);
      });
      return;

    case 'eth_sendTransaction':
      txParams = payload.params[0];
      waterfall([function (cb) {
        return self.validateTransaction(txParams, cb);
      }, function (cb) {
        return self.processTransaction(txParams, cb);
      }], end);
      return;

    case 'eth_signTransaction':
      txParams = payload.params[0];
      waterfall([function (cb) {
        return self.validateTransaction(txParams, cb);
      }, function (cb) {
        return self.processSignTransaction(txParams, cb);
      }], end);
      return;

    case 'eth_sign':
      // process normally
      address = payload.params[0];
      message = payload.params[1];
      // non-standard "extraParams" to be appended to our "msgParams" obj
      // good place for metadata
      extraParams = payload.params[2] || {};
      msgParams = extend(extraParams, {
        from: address,
        data: message
      });
      waterfall([function (cb) {
        return self.validateMessage(msgParams, cb);
      }, function (cb) {
        return self.processMessage(msgParams, cb);
      }], end);
      return;

    case 'personal_sign':
      return function () {
        // process normally
        var first = payload.params[0];
        var second = payload.params[1];

        // We initially incorrectly ordered these parameters.
        // To gracefully respect users who adopted this API early,
        // we are currently gracefully recovering from the wrong param order
        // when it is clearly identifiable.
        //
        // That means when the first param is definitely an address,
        // and the second param is definitely not, but is hex.
        if (resemblesData(second) && resemblesAddress(first)) {
          var warning = 'The eth_personalSign method requires params ordered ';
          warning += '[message, address]. This was previously handled incorrectly, ';
          warning += 'and has been corrected automatically. ';
          warning += 'Please switch this param order for smooth behavior in the future.';
          console.warn(warning);

          address = payload.params[0];
          message = payload.params[1];
        } else {
          message = payload.params[0];
          address = payload.params[1];
        }

        // non-standard "extraParams" to be appended to our "msgParams" obj
        // good place for metadata
        extraParams = payload.params[2] || {};
        msgParams = extend(extraParams, {
          from: address,
          data: message
        });
        waterfall([function (cb) {
          return self.validatePersonalMessage(msgParams, cb);
        }, function (cb) {
          return self.processPersonalMessage(msgParams, cb);
        }], end);
      }();

    case 'personal_ecRecover':
      return function () {
        message = payload.params[0];
        var signature = payload.params[1];
        // non-standard "extraParams" to be appended to our "msgParams" obj
        // good place for metadata
        extraParams = payload.params[2] || {};
        msgParams = extend(extraParams, {
          sig: signature,
          data: message
        });
        self.recoverPersonalSignature(msgParams, end);
      }();

    case 'eth_signTypedData':
      // process normally
      message = payload.params[0];
      address = payload.params[1];
      extraParams = payload.params[2] || {};
      msgParams = extend(extraParams, {
        from: address,
        data: message
      });
      waterfall([function (cb) {
        return self.validateTypedMessage(msgParams, cb);
      }, function (cb) {
        return self.processTypedMessage(msgParams, cb);
      }], end);
      return;

    case 'parity_postTransaction':
      txParams = payload.params[0];
      self.parityPostTransaction(txParams, end);
      return;

    case 'parity_postSign':
      address = payload.params[0];
      message = payload.params[1];
      self.parityPostSign(address, message, end);
      return;

    case 'parity_checkRequest':
      return function () {
        var requestId = payload.params[0];
        self.parityCheckRequest(requestId, end);
      }();

    case 'parity_defaultAccount':
      self.getAccounts(function (err, accounts) {
        if (err) return end(err);
        var account = accounts[0] || null;
        end(null, account);
      });
      return;

    default:
      next();
      return;

  }
};

//
// data lookup
//

HookedWalletSubprovider.prototype.getAccounts = function (cb) {
  cb(null, []);
};

//
// "process" high level flow
//

HookedWalletSubprovider.prototype.processTransaction = function (txParams, cb) {
  var self = this;
  waterfall([function (cb) {
    return self.approveTransaction(txParams, cb);
  }, function (didApprove, cb) {
    return self.checkApproval('transaction', didApprove, cb);
  }, function (cb) {
    return self.finalizeAndSubmitTx(txParams, cb);
  }], cb);
};

HookedWalletSubprovider.prototype.processSignTransaction = function (txParams, cb) {
  var self = this;
  waterfall([function (cb) {
    return self.approveTransaction(txParams, cb);
  }, function (didApprove, cb) {
    return self.checkApproval('transaction', didApprove, cb);
  }, function (cb) {
    return self.finalizeTx(txParams, cb);
  }], cb);
};

HookedWalletSubprovider.prototype.processMessage = function (msgParams, cb) {
  var self = this;
  waterfall([function (cb) {
    return self.approveMessage(msgParams, cb);
  }, function (didApprove, cb) {
    return self.checkApproval('message', didApprove, cb);
  }, function (cb) {
    return self.signMessage(msgParams, cb);
  }], cb);
};

HookedWalletSubprovider.prototype.processPersonalMessage = function (msgParams, cb) {
  var self = this;
  waterfall([function (cb) {
    return self.approvePersonalMessage(msgParams, cb);
  }, function (didApprove, cb) {
    return self.checkApproval('message', didApprove, cb);
  }, function (cb) {
    return self.signPersonalMessage(msgParams, cb);
  }], cb);
};

HookedWalletSubprovider.prototype.processTypedMessage = function (msgParams, cb) {
  var self = this;
  waterfall([function (cb) {
    return self.approveTypedMessage(msgParams, cb);
  }, function (didApprove, cb) {
    return self.checkApproval('message', didApprove, cb);
  }, function (cb) {
    return self.signTypedMessage(msgParams, cb);
  }], cb);
};

//
// approval
//

HookedWalletSubprovider.prototype.autoApprove = function (txParams, cb) {
  cb(null, true);
};

HookedWalletSubprovider.prototype.checkApproval = function (type, didApprove, cb) {
  cb(didApprove ? null : new Error('User denied ' + type + ' signature.'));
};

//
// parity
//

HookedWalletSubprovider.prototype.parityPostTransaction = function (txParams, cb) {
  var self = this;

  // get next id
  var count = self._parityRequestCount;
  var reqId = '0x' + count.toString(16);
  self._parityRequestCount++;

  self.emitPayload({
    method: 'eth_sendTransaction',
    params: [txParams]
  }, function (error, res) {
    if (error) {
      self._parityRequests[reqId] = { error: error };
      return;
    }
    var txHash = res.result;
    self._parityRequests[reqId] = txHash;
  });

  cb(null, reqId);
};

HookedWalletSubprovider.prototype.parityPostSign = function (address, message, cb) {
  var self = this;

  // get next id
  var count = self._parityRequestCount;
  var reqId = '0x' + count.toString(16);
  self._parityRequestCount++;

  self.emitPayload({
    method: 'eth_sign',
    params: [address, message]
  }, function (error, res) {
    if (error) {
      self._parityRequests[reqId] = { error: error };
      return;
    }
    var result = res.result;
    self._parityRequests[reqId] = result;
  });

  cb(null, reqId);
};

HookedWalletSubprovider.prototype.parityCheckRequest = function (reqId, cb) {
  var self = this;
  var result = self._parityRequests[reqId] || null;
  // tx not handled yet
  if (!result) return cb(null, null);
  // tx was rejected (or other error)
  if (result.error) return cb(result.error);
  // tx sent
  cb(null, result);
};

//
// signature and recovery
//

HookedWalletSubprovider.prototype.recoverPersonalSignature = function (msgParams, cb) {
  var senderHex = void 0;
  try {
    senderHex = sigUtil.recoverPersonalSignature(msgParams);
  } catch (err) {
    return cb(err);
  }
  cb(null, senderHex);
};

//
// validation
//

HookedWalletSubprovider.prototype.validateTransaction = function (txParams, cb) {
  var self = this;
  // shortcut: undefined sender is invalid
  if (txParams.from === undefined) return cb(new Error('Undefined address - from address required to sign transaction.'));
  self.validateSender(txParams.from, function (err, senderIsValid) {
    if (err) return cb(err);
    if (!senderIsValid) return cb(new Error('Unknown address - unable to sign transaction for this address: "' + txParams.from + '"'));
    cb();
  });
};

HookedWalletSubprovider.prototype.validateMessage = function (msgParams, cb) {
  var self = this;
  if (msgParams.from === undefined) return cb(new Error('Undefined address - from address required to sign message.'));
  self.validateSender(msgParams.from, function (err, senderIsValid) {
    if (err) return cb(err);
    if (!senderIsValid) return cb(new Error('Unknown address - unable to sign message for this address: "' + msgParams.from + '"'));
    cb();
  });
};

HookedWalletSubprovider.prototype.validatePersonalMessage = function (msgParams, cb) {
  var self = this;
  if (msgParams.from === undefined) return cb(new Error('Undefined address - from address required to sign personal message.'));
  if (msgParams.data === undefined) return cb(new Error('Undefined message - message required to sign personal message.'));
  if (!isValidHex(msgParams.data)) return cb(new Error('HookedWalletSubprovider - validateMessage - message was not encoded as hex.'));
  self.validateSender(msgParams.from, function (err, senderIsValid) {
    if (err) return cb(err);
    if (!senderIsValid) return cb(new Error('Unknown address - unable to sign message for this address: "' + msgParams.from + '"'));
    cb();
  });
};

HookedWalletSubprovider.prototype.validateTypedMessage = function (msgParams, cb) {
  if (msgParams.from === undefined) return cb(new Error('Undefined address - from address required to sign typed data.'));
  if (msgParams.data === undefined) return cb(new Error('Undefined data - message required to sign typed data.'));
  this.validateSender(msgParams.from, function (err, senderIsValid) {
    if (err) return cb(err);
    if (!senderIsValid) return cb(new Error('Unknown address - unable to sign message for this address: "' + msgParams.from + '"'));
    cb();
  });
};

HookedWalletSubprovider.prototype.validateSender = function (senderAddress, cb) {
  var self = this;
  // shortcut: undefined sender is invalid
  if (!senderAddress) return cb(null, false);
  self.getAccounts(function (err, accounts) {
    if (err) return cb(err);
    var senderIsValid = accounts.map(toLowerCase).indexOf(senderAddress.toLowerCase()) !== -1;
    cb(null, senderIsValid);
  });
};

//
// tx helpers
//

HookedWalletSubprovider.prototype.finalizeAndSubmitTx = function (txParams, cb) {
  var self = this;
  // can only allow one tx to pass through this flow at a time
  // so we can atomically consume a nonce
  self.nonceLock.take(function () {
    waterfall([self.fillInTxExtras.bind(self, txParams), self.signTransaction.bind(self), self.publishTransaction.bind(self)], function (err, txHash) {
      self.nonceLock.leave();
      if (err) return cb(err);
      cb(null, txHash);
    });
  });
};

HookedWalletSubprovider.prototype.finalizeTx = function (txParams, cb) {
  var self = this;
  // can only allow one tx to pass through this flow at a time
  // so we can atomically consume a nonce
  self.nonceLock.take(function () {
    waterfall([self.fillInTxExtras.bind(self, txParams), self.signTransaction.bind(self)], function (err, signedTx) {
      self.nonceLock.leave();
      if (err) return cb(err);
      cb(null, { raw: signedTx, tx: txParams });
    });
  });
};

HookedWalletSubprovider.prototype.publishTransaction = function (rawTx, cb) {
  var self = this;
  self.emitPayload({
    method: 'eth_sendRawTransaction',
    params: [rawTx]
  }, function (err, res) {
    if (err) return cb(err);
    cb(null, res.result);
  });
};

HookedWalletSubprovider.prototype.estimateGas = function (txParams, cb) {
  var self = this;
  estimateGas(self.engine, txParams, cb);
};

HookedWalletSubprovider.prototype.getGasPrice = function (cb) {
  var self = this;
  self.emitPayload({ method: 'eth_gasPrice', params: [] }, function (err, res) {
    if (err) return cb(err);
    cb(null, res.result);
  });
};

HookedWalletSubprovider.prototype.fillInTxExtras = function (txParams, cb) {
  var self = this;
  var address = txParams.from;
  // console.log('fillInTxExtras - address:', address)

  var tasks = {};

  if (txParams.gasPrice === undefined) {
    // console.log("need to get gasprice")
    tasks.gasPrice = self.getGasPrice.bind(self);
  }

  if (txParams.nonce === undefined) {
    // console.log("need to get nonce")
    tasks.nonce = self.emitPayload.bind(self, { method: 'eth_getTransactionCount', params: [address, 'pending'] });
  }

  if (txParams.gas === undefined) {
    // console.log("need to get gas")
    tasks.gas = self.estimateGas.bind(self, cloneTxParams(txParams));
  }

  parallel(tasks, function (err, taskResults) {
    if (err) return cb(err);

    var result = {};
    if (taskResults.gasPrice) result.gasPrice = taskResults.gasPrice;
    if (taskResults.nonce) result.nonce = taskResults.nonce.result;
    if (taskResults.gas) result.gas = taskResults.gas;

    cb(null, extend(txParams, result));
  });
};

// util

// we use this to clean any custom params from the txParams
function cloneTxParams(txParams) {
  return {
    from: txParams.from,
    to: txParams.to,
    value: txParams.value,
    data: txParams.data,
    gas: txParams.gas,
    gasPrice: txParams.gasPrice,
    nonce: txParams.nonce
  };
}

function toLowerCase(string) {
  return string.toLowerCase();
}

function resemblesAddress(string) {
  var fixed = ethUtil.addHexPrefix(string);
  var isValid = ethUtil.isValidAddress(fixed);
  return isValid;
}

// Returns true if resembles hex data
// but definitely not a valid address.
function resemblesData(string) {
  var fixed = ethUtil.addHexPrefix(string);
  var isValidAddress = ethUtil.isValidAddress(fixed);
  return !isValidAddress && isValidHex(string);
}

function isValidHex(data) {
  var isString = typeof data === 'string';
  if (!isString) return false;
  var isHexPrefixed = data.slice(0, 2) === '0x';
  if (!isHexPrefixed) return false;
  var nonPrefixed = data.slice(2);
  var isValid = nonPrefixed.match(hexRegex);
  return isValid;
}

function mustProvideInConstructor(methodName) {
  return function (params, cb) {
    cb(new Error('ProviderEngine - HookedWalletSubprovider - Must provide "' + methodName + '" fn in constructor options'));
  };
}