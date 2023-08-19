'use strict'

exports.BigNumber = require('bignumber.js').BigNumber
exports.Commented = require('./commented')
exports.Diagnose = require('./diagnose')
exports.Decoder = require('./decoder')
exports.Encoder = require('./encoder')
exports.Simple = require('./simple')
exports.Tagged = require('./tagged')
exports.Map = require('./map')

exports.comment = exports.Commented.comment
exports.decodeAll = exports.Decoder.decodeAll
exports.decodeFirst = exports.Decoder.decodeFirst
exports.decodeAllSync = exports.Decoder.decodeAllSync
exports.decodeFirstSync = exports.Decoder.decodeFirstSync
exports.diagnose = exports.Diagnose.diagnose
exports.encode = exports.Encoder.encode
exports.encodeCanonical = exports.Encoder.encodeCanonical
exports.encodeOne = exports.Encoder.encodeOne
exports.encodeAsync = exports.Encoder.encodeAsync
exports.decode = exports.Decoder.decodeFirstSync

exports.leveldb = {
  decode: exports.Decoder.decodeAllSync,
  encode: exports.Encoder.encode,
  buffer: true,
  name: 'cbor'
}

exports.hasBigInt = require('./utils').hasBigInt
