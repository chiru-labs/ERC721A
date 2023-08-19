"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.namehash = namehash;

var _labelhash = require("./labelhash");

var _ethEnsNamehash = require("eth-ens-namehash");

var sha3 = require('js-sha3').keccak_256;

function namehash(inputName) {
  var node = '';

  for (var i = 0; i < 32; i++) {
    node += '00';
  }

  if (inputName) {
    var labels = inputName.split('.');

    for (var _i = labels.length - 1; _i >= 0; _i--) {
      var labelSha = void 0;

      if ((0, _labelhash.isEncodedLabelhash)(labels[_i])) {
        labelSha = (0, _labelhash.decodeLabelhash)(labels[_i]);
      } else {
        var normalisedLabel = (0, _ethEnsNamehash.normalize)(labels[_i]);
        labelSha = sha3(normalisedLabel);
      }

      node = sha3(new Buffer(node + labelSha, 'hex'));
    }
  }

  return '0x' + node;
}