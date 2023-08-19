'use strict';

module.exports = StorageReader;

function StorageReader(stateManager) {
  this._stateManager = stateManager;
  this._storageCache = new Map();
}

var proto = StorageReader.prototype;

proto.getContractStorage = function getContractStorage(address, key, cb) {
  var self = this;
  var addressHex = address.toString('hex');
  var keyHex = key.toString('hex');

  self._stateManager.getContractStorage(address, key, function (err, current) {
    if (err) return cb(err);

    var map = null;
    if (!self._storageCache.has(addressHex)) {
      map = new Map();
      self._storageCache.set(addressHex, map);
    } else {
      map = self._storageCache.get(addressHex);
    }

    var original = null;

    if (map.has(keyHex)) {
      original = map.get(keyHex);
    } else {
      map.set(keyHex, current);
      original = current;
    }

    cb(null, {
      original: original,
      current: current
    });
  });
};