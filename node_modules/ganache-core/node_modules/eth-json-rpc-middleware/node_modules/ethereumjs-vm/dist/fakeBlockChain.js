'use strict';

var Buffer = require('safe-buffer').Buffer;
var utils = require('ethereumjs-util');

module.exports = {
  fake: true,
  getBlock: function getBlock(blockTag, cb) {
    var _hash;

    if (Buffer.isBuffer(blockTag)) {
      _hash = utils.keccak256(blockTag);
    } else if (Number.isInteger(blockTag)) {
      _hash = utils.keccak256('0x' + utils.toBuffer(blockTag).toString('hex'));
    } else {
      return cb(new Error('Unknown blockTag type'));
    }

    var block = {
      hash: function hash() {
        return _hash;
      }
    };

    cb(null, block);
  },

  delBlock: function delBlock(hash, cb) {
    cb(null);
  },

  iterator: function iterator(name, onBlock, cb) {
    cb(null);
  }
};