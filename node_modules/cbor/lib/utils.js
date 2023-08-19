'use strict'

const util = require('util')
const bignumber = require('bignumber.js').BigNumber

const constants = require('./constants')
const NUMBYTES = constants.NUMBYTES
const SHIFT32 = constants.SHIFT32
const MAX_SAFE_HIGH = 0x1fffff

exports.hasBigInt = (typeof BigInt === 'function')

/**
 * Convert a UTF8-encoded Buffer to a JS string.  If possible, throw an error
 * on invalid UTF8.  Byte Order Marks are not looked at or stripped.
 */
const TD = (typeof TextDecoder === 'function') ? TextDecoder : util.TextDecoder
/* istanbul ignore else */
if (TD) {
  // node 11+, browsers : node 8.3+
  const td = new TD('utf8', {fatal: true, ignoreBOM: true})
  exports.utf8 = (buf) => td.decode(buf)
  exports.utf8.checksUTF8 = true
} else {
  // TODO: polyfill a slow one or wait for node6 to die
  exports.utf8 = (buf) => buf.toString('utf8') 
  exports.utf8.checksUTF8 = false  
}

exports.parseCBORint = function(ai, buf) {
  switch (ai) {
    case NUMBYTES.ONE:
      return buf.readUInt8(0)
    case NUMBYTES.TWO:
      return buf.readUInt16BE(0)
    case NUMBYTES.FOUR:
      return buf.readUInt32BE(0)
    case NUMBYTES.EIGHT:
      const f = buf.readUInt32BE(0)
      const g = buf.readUInt32BE(4)
      if (f > MAX_SAFE_HIGH) {
        return new bignumber(f).times(SHIFT32).plus(g)
      } else {
        return (f * SHIFT32) + g
      }
    default:
      throw new Error('Invalid additional info for int: ' + ai)
  }
}

exports.writeHalf = function writeHalf(buf, half) {
  // assume 0, -0, NaN, Infinity, and -Infinity have already been caught

  // HACK: everyone settle in.  This isn't going to be pretty.
  // Translate cn-cbor's C code (from Carsten Borman):

  // uint32_t be32;
  // uint16_t be16, u16;
  // union {
  //   float f;
  //   uint32_t u;
  // } u32;
  // u32.f = float_val;

  const u32 = Buffer.allocUnsafe(4)
  u32.writeFloatBE(half, 0)
  const u = u32.readUInt32BE(0)

  // if ((u32.u & 0x1FFF) == 0) { /* worth trying half */

  // hildjj: If the lower 13 bits aren't 0,
  // we will lose precision in the conversion.
  // mant32 = 24bits, mant16 = 11bits, 24-11 = 13
  if ((u & 0x1FFF) !== 0) {
    return false
  }

  //   int s16 = (u32.u >> 16) & 0x8000;
  //   int exp = (u32.u >> 23) & 0xff;
  //   int mant = u32.u & 0x7fffff;

  let s16 = (u >> 16) & 0x8000 // top bit is sign
  const exp = (u >> 23) & 0xff // then 5 bits of exponent
  const mant = u & 0x7fffff

  //   if (exp == 0 && mant == 0)
  //     ;              /* 0.0, -0.0 */

  // hildjj: zeros already handled.  Assert if you don't believe me.

  //   else if (exp >= 113 && exp <= 142) /* normalized */
  //     s16 += ((exp - 112) << 10) + (mant >> 13);

  if ((exp >= 113) && (exp <= 142)) {
    s16 += ((exp - 112) << 10) + (mant >> 13)
  } else if ((exp >= 103) && (exp < 113)) {
    //   else if (exp >= 103 && exp < 113) { /* denorm, exp16 = 0 */
    //     if (mant & ((1 << (126 - exp)) - 1))
    //       goto float32;         /* loss of precision */
    //     s16 += ((mant + 0x800000) >> (126 - exp));

    if (mant & ((1 << (126 - exp)) - 1)) {
      return false
    }
    s16 += ((mant + 0x800000) >> (126 - exp))
  } else {
  //   } else if (exp == 255 && mant == 0) { /* Inf */
  //     s16 += 0x7c00;

    // hildjj: Infinity already handled

    //   } else
    //     goto float32;           /* loss of range */

    return false
  }

  //   ensure_writable(3);
  //   u16 = s16;
  //   be16 = hton16p((const uint8_t*)&u16);
  buf.writeUInt16BE(s16)
  return true
}

exports.parseHalf = function parseHalf(buf) {
  const sign = buf[0] & 0x80 ? -1 : 1
  const exp = (buf[0] & 0x7C) >> 2
  const mant = ((buf[0] & 0x03) << 8) | buf[1]
  if (!exp) {
    return sign * 5.9604644775390625e-8 * mant
  } else if (exp === 0x1f) {
    return sign * (mant ? 0 / 0 : 2e308)
  } else {
    return sign * Math.pow(2, exp - 25) * (1024 + mant)
  }
}

exports.parseCBORfloat = function parseCBORfloat(buf) {
  switch (buf.length) {
    case 2:
      return exports.parseHalf(buf)
    case 4:
      return buf.readFloatBE(0)
    case 8:
      return buf.readDoubleBE(0)
    default:
      throw new Error('Invalid float size: ' + buf.length)
  }
}

exports.hex = function hex(s) {
  return Buffer.from(s.replace(/^0x/, ''), 'hex')
}

exports.bin = function bin(s) {
  s = s.replace(/\s/g, '')
  let start = 0
  let end = (s.length % 8) || 8
  const chunks = []
  while (end <= s.length) {
    chunks.push(parseInt(s.slice(start, end), 2))
    start = end
    end += 8
  }
  return Buffer.from(chunks)
}

exports.extend = function extend(old={}, ...adds) {
  const len = adds.length
  for (let j = 0; j < len; j++) {
    const a = adds[j]
    for (const k in a) {
      const v = a[k]
      old[k] = v
    }
  }
  return old
}

exports.arrayEqual = function arrayEqual(a, b) {
  if ((a == null) && (b == null)) {
    return true
  }
  if ((a == null) || (b == null)) {
    return false
  }
  return (a.length === b.length) && a.every((elem, i) => elem === b[i])
}

exports.bufferEqual = function bufferEqual(a, b) {
  if ((a == null) && (b == null)) {
    return true
  }
  if ((a == null) || (b == null)) {
    return false
  }
  if (!(Buffer.isBuffer(a) && Buffer.isBuffer(b) && (a.length === b.length))) {
    return false
  }
  const len = a.length
  let ret = true
  let i
  let j
  for (i = j = 0; j < len; i = ++j) {
    const byte = a[i]
    ret = ret && (b[i] === byte)
  }
  return !!ret
}

exports.bufferToBignumber = function bufferToBignumber(buf) {
  return new bignumber(buf.toString('hex'), 16)
}

exports.toBigInt = function toBigInt(num) {
  if (!exports.hasBigInt) {
    return Number(num) // lossy.  Better than nothing?
  }
  return BigInt(num)
}

exports.bigIntize = function bigIntize(obj) {
  const ret = {}
  for (const k in obj) { // stupid node 6
    ret[k] = exports.toBigInt(obj[k])
  }
  return ret
}

exports.bufferToBigInt = function bufferToBigInt(buf) {
  return exports.toBigInt('0x' + buf.toString('hex'))
}

exports.guessEncoding = function guessEncoding(input) {
  if (typeof input == 'string') {
    return 'hex'
  } else if (Buffer.isBuffer(input)) {
    return undefined
  }
  throw new Error('Unknown input type')
}

