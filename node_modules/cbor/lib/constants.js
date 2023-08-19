'use strict'
const bignumber = require('bignumber.js').BigNumber

exports.MT = {
  POS_INT: 0,
  NEG_INT: 1,
  BYTE_STRING: 2,
  UTF8_STRING: 3,
  ARRAY: 4,
  MAP: 5,
  TAG: 6,
  SIMPLE_FLOAT: 7
}

exports.TAG = {
  DATE_STRING: 0,
  DATE_EPOCH: 1,
  POS_BIGINT: 2,
  NEG_BIGINT: 3,
  DECIMAL_FRAC: 4,
  BIGFLOAT: 5,
  BASE64URL_EXPECTED: 21,
  BASE64_EXPECTED: 22,
  BASE16_EXPECTED: 23,
  CBOR: 24,
  URI: 32,
  BASE64URL: 33,
  BASE64: 34,
  REGEXP: 35,
  MIME: 36
}

exports.NUMBYTES = {
  ZERO: 0,
  ONE: 24,
  TWO: 25,
  FOUR: 26,
  EIGHT: 27,
  INDEFINITE: 31
}

exports.SIMPLE = {
  FALSE: 20,
  TRUE: 21,
  NULL: 22,
  UNDEFINED: 23
}

exports.SYMS = {
  NULL: Symbol('null'),
  UNDEFINED: Symbol('undef'),
  PARENT: Symbol('parent'),
  BREAK: Symbol('break'),
  STREAM: Symbol('stream')
}

exports.SHIFT32 = 0x100000000

exports.BI = {
  MINUS_ONE: -1,
  MAXINT32: 0xffffffff,
  MAXINT64: '0xffffffffffffffff',
  SHIFT32: exports.SHIFT32
}

const MINUS_ONE = new bignumber(-1)
exports.BN = {
  MINUS_ONE,
  NEG_MAX: MINUS_ONE.minus(
    new bignumber(Number.MAX_SAFE_INTEGER.toString(16), 16)),
  MAXINT: new bignumber('0x20000000000000'),
  MAXINT32: new bignumber(0xffffffff),
  MAXINT64: new bignumber('0xffffffffffffffff'),
  SHIFT32: new bignumber(exports.SHIFT32)
}
