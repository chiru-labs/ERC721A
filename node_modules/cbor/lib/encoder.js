'use strict'

const stream = require('stream')
const url = require('url')
const bignumber = require('bignumber.js').BigNumber
const NoFilter = require('nofilter')
const Tagged = require('./tagged')
const Simple = require('./simple')
const utils = require('./utils')

const constants = require('./constants')
const MT = constants.MT
const NUMBYTES = constants.NUMBYTES
const SHIFT32 = constants.SHIFT32
const SYMS = constants.SYMS
const TAG = constants.TAG
const HALF = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.TWO
const FLOAT = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.FOUR
const DOUBLE = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.EIGHT
const TRUE = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.TRUE
const FALSE = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.FALSE
const UNDEFINED = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.UNDEFINED
const NULL = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.NULL
const BREAK = Buffer.from([0xff])

const BI = utils.bigIntize(constants.BI)
const BN = constants.BN
const BUF_NAN = Buffer.from('f97e00', 'hex')
const BUF_INF_NEG = Buffer.from('f9fc00', 'hex')
const BUF_INF_POS = Buffer.from('f97c00', 'hex')
const BUF_NEG_ZERO = Buffer.from('f98000', 'hex')
const LOOP_DETECT = Symbol('CBOR_LOOP_DETECT')

/**
 * Transform JavaScript values into CBOR bytes.  The `Writable` side of
 * the stream is in object mode.
 *
 * @extends {stream.Transform}
 */
class Encoder extends stream.Transform {

  /**
   * Creates an instance of Encoder.
   *
   * @param {Object} [options={}] - options for the encoder
   * @param {any[]} [options.genTypes=[]] - array of pairs of `type`,
   *   `function(Encoder)` for semantic types to be encoded.  Not needed
   *   for Array, Date, Buffer, Map, RegExp, Set, Url, or bignumber.
   * @param {boolean} [options.canonical=false] - should the output be
   *   canonicalized
   * @param {boolean|Symbol} [options.detectLoops=false] - should object loops
   *   be detected?  This will currently modify the encoded object graph
   *   by adding a Symbol property to each object.  If this bothers you,
   *   call `removeLoopDetectors` on the encoded object when done.  Do not
   *   encode the same object twice on the same encoder, without calling
   *   `removeLoopDetectors` in between.
   * @param {("number"|"float"|"int"|"string")} [options.dateType="number"] -
   *   how should dates be encoded?  "number" means float or int, if no
   *   fractional seconds.
   * @param {any} [options.encodeUndefined=undefined] - How should an 
   *   "undefined" in the input be encoded.  By default, just encode a CBOR
   *   undefined.  If this is a buffer, use those bytes without re-encoding
   *   them.  If this is a function, the function will be called (which is
   *   a good time to throw an exception, if that's what you want), and the
   *   return value will be used according to these rules.  Anything
   *   else will be encoded as CBOR.
   * @param {boolean} [options.disallowUndefinedKeys=false] - Should "undefined"
   *   be disallowed as a key in a Map that is serialized?  If this is true,
   *   encode(new Map([[undefined, 1]])) will throw an exception.  Note that
   *   it is impossible to get a key of undefined in a normal JS object.
   * @param {boolean} [options.collapseBigIntegers=false] - Should integers
   *   that come in as BigNumber integers and ECMAscript bigint's be encoded
   *   as normal CBOR integers if they fit, discarding type information?
   */
  constructor(options) {
    const opts = Object.assign({}, options, {
      readableObjectMode: false,
      writableObjectMode: true
    })
    super(opts)

    this.canonical = opts.canonical
    this.encodeUndefined = opts.encodeUndefined
    this.disallowUndefinedKeys = !!opts.disallowUndefinedKeys
    this.dateType = (opts.dateType != null) ?
      opts.dateType.toLowerCase() : 'number'
    this.collapseBigIntegers = !!opts.collapseBigIntegers

    // new Symbol for each instance.  Note: means we can't re-use the same
    // encoder and encoded object
    if (typeof(opts.detectLoops) === 'symbol') {
      this.detectLoops = opts.detectLoops
    } else {
      this.detectLoops = !!opts.detectLoops ? Symbol('CBOR_DETECT') : null
    }

    this.semanticTypes = {
      Array: this._pushArray,
      Date: this._pushDate,
      Buffer: this._pushBuffer,
      Map: this._pushMap,
      NoFilter: this._pushNoFilter,
      RegExp: this._pushRegexp,
      Set: this._pushSet,
      BigNumber: this._pushBigNumber,
      ArrayBuffer: this._pushUint8Array,
      Uint8ClampedArray: this._pushUint8Array,
      Uint8Array: this._pushUint8Array,
      Uint16Array: this._pushArray,
      Uint32Array: this._pushArray,
      Int8Array: this._pushArray,
      Int16Array: this._pushArray,
      Int32Array: this._pushArray,
      Float32Array: this._pushFloat32Array,
      Float64Array: this._pushFloat64Array
    }

    // tsc doesn't know about old Url
    if (url['Url']) {
      this.addSemanticType('Url', this._pushUrl)
    }
    if (url['URL']) {
      this.addSemanticType('URL', this._pushURL)
    }

    const addTypes = opts.genTypes || []
    for (let i = 0, len = addTypes.length; i < len; i += 2) {
      this.addSemanticType(addTypes[i], addTypes[i + 1])
    }
  }

  _transform(fresh, encoding, cb) {
    const ret = this.pushAny(fresh)
    // Old transformers might not return bool.  undefined !== false
    return cb((ret === false) ? new Error('Push Error') : undefined)
  }

  _flush(cb) {
    return cb()
  }

  /**
   * @callback encodeFunction
   * @param {Encoder} encoder - the encoder to serialize into.  Call "write"
   *   on the encoder as needed.
   * @return {bool} - true on success, else false
   */

  /**
   * Add an encoding function to the list of supported semantic types.  This is
   * useful for objects for which you can't add an encodeCBOR method
   *
   * @param {any} type
   * @param {any} fun
   * @returns {encodeFunction}
   */
  addSemanticType(type, fun) {
    if (typeof fun !== 'function') {
      throw new TypeError('fun must be of type function')
    }
    const typeName = (typeof type === 'string') ? type : type.name
    const old = this.semanticTypes[typeName]
    this.semanticTypes[typeName] = fun
    return old
  }

  _pushUInt8(val) {
    const b = Buffer.allocUnsafe(1)
    b.writeUInt8(val, 0)
    return this.push(b)
  }

  _pushUInt16BE(val) {
    const b = Buffer.allocUnsafe(2)
    b.writeUInt16BE(val, 0)
    return this.push(b)
  }

  _pushUInt32BE(val) {
    const b = Buffer.allocUnsafe(4)
    b.writeUInt32BE(val, 0)
    return this.push(b)
  }

  _pushFloatBE(val) {
    const b = Buffer.allocUnsafe(4)
    b.writeFloatBE(val, 0)
    return this.push(b)
  }

  _pushDoubleBE(val) {
    const b = Buffer.allocUnsafe(8)
    b.writeDoubleBE(val, 0)
    return this.push(b)
  }

  _pushNaN() {
    return this.push(BUF_NAN)
  }

  _pushInfinity(obj) {
    const half = (obj < 0) ? BUF_INF_NEG : BUF_INF_POS
    return this.push(half)
  }

  _pushFloat(obj) {
    if (this.canonical) {
      // TODO: is this enough slower to hide behind canonical?
      // It's certainly enough of a hack (see utils.parseHalf)

      // From section 3.9:
      // If a protocol allows for IEEE floats, then additional canonicalization
      // rules might need to be added.  One example rule might be to have all
      // floats start as a 64-bit float, then do a test conversion to a 32-bit
      // float; if the result is the same numeric value, use the shorter value
      // and repeat the process with a test conversion to a 16-bit float.  (This
      // rule selects 16-bit float for positive and negative Infinity as well.)

      // which seems pretty much backwards to me.
      const b2 = Buffer.allocUnsafe(2)
      if (utils.writeHalf(b2, obj)) {
        // I have convinced myself that there are no cases where writeHalf
        // will return true but `utils.parseHalf(b2) !== obj)`
        return this._pushUInt8(HALF) && this.push(b2)
      }
    }
    if (Math.fround(obj) === obj) {
      return this._pushUInt8(FLOAT) && this._pushFloatBE(obj)
    }

    return this._pushUInt8(DOUBLE) && this._pushDoubleBE(obj)
  }

  _pushInt(obj, mt, orig) {
    const m = mt << 5
    switch (false) {
      case !(obj < 24):
        return this._pushUInt8(m | obj)
      case !(obj <= 0xff):
        return this._pushUInt8(m | NUMBYTES.ONE) && this._pushUInt8(obj)
      case !(obj <= 0xffff):
        return this._pushUInt8(m | NUMBYTES.TWO) && this._pushUInt16BE(obj)
      case !(obj <= 0xffffffff):
        return this._pushUInt8(m | NUMBYTES.FOUR) && this._pushUInt32BE(obj)
      case !(obj <= Number.MAX_SAFE_INTEGER):
        return this._pushUInt8(m | NUMBYTES.EIGHT) &&
          this._pushUInt32BE(Math.floor(obj / SHIFT32)) &&
          this._pushUInt32BE(obj % SHIFT32)
      default:
        if (mt === MT.NEG_INT) {
          return this._pushFloat(orig)
        } else {
          return this._pushFloat(obj)
        }
    }
  }

  _pushIntNum(obj) {
    if (Object.is(obj, -0)) {
      return this.push(BUF_NEG_ZERO)
    }

    if (obj < 0) {
      return this._pushInt(-obj - 1, MT.NEG_INT, obj)
    } else {
      return this._pushInt(obj, MT.POS_INT)
    }
  }

  _pushNumber(obj) {
    switch (false) {
      case !isNaN(obj):
        return this._pushNaN()
      case isFinite(obj):
        return this._pushInfinity(obj)
      case Math.round(obj) !== obj:
        return this._pushIntNum(obj)
      default:
        return this._pushFloat(obj)
    }
  }

  _pushString(obj) {
    const len = Buffer.byteLength(obj, 'utf8')
    return this._pushInt(len, MT.UTF8_STRING) && this.push(obj, 'utf8')
  }

  _pushBoolean(obj) {
    return this._pushUInt8(obj ? TRUE : FALSE)
  }

  _pushUndefined(obj) {
    switch (typeof this.encodeUndefined) {
      case 'undefined':
        return this._pushUInt8(UNDEFINED)
      case 'function':
        return this.pushAny(this.encodeUndefined.call(this, obj))
      case 'object':
        if (Buffer.isBuffer(this.encodeUndefined)) {
          return this.push(this.encodeUndefined)
        }
    }
    return this.pushAny(this.encodeUndefined)
  }

  _pushNull(obj) {
    return this._pushUInt8(NULL)
  }

  _pushArray(gen, obj, opts) {
    opts = Object.assign({
      indefinite: false
    }, opts)
    const len = obj.length
    if (opts.indefinite) {
      if (!gen._pushUInt8((MT.ARRAY << 5) | NUMBYTES.INDEFINITE)) {
        return false
      }
    } else if (!gen._pushInt(len, MT.ARRAY)) {
      return false
    }
    for (let j = 0; j < len; j++) {
      if (!gen.pushAny(obj[j])) {
        return false
      }
    }
    if (opts.indefinite) {
      if (!gen.push(BREAK)) {
        return false
      }
    }
    return true
  }

  _pushTag(tag) {
    return this._pushInt(tag, MT.TAG)
  }

  _pushDate(gen, obj) {
    switch (gen.dateType) {
      case 'string':
        return gen._pushTag(TAG.DATE_STRING) &&
          gen._pushString(obj.toISOString())
      case 'int':
      case 'integer':
        return gen._pushTag(TAG.DATE_EPOCH) &&
          gen._pushIntNum(Math.round(obj / 1000))
      case 'float':
        // force float
        return gen._pushTag(TAG.DATE_EPOCH) &&
          gen._pushFloat(obj / 1000)
      case 'number':
      default:
        // if we happen to have an integral number of seconds,
        // use integer.  Otherwise, use float.
        return gen._pushTag(TAG.DATE_EPOCH) &&
          gen.pushAny(obj / 1000)
    }
  }

  _pushBuffer(gen, obj) {
    return gen._pushInt(obj.length, MT.BYTE_STRING) && gen.push(obj)
  }

  _pushNoFilter(gen, obj) {
    return gen._pushBuffer(gen, obj.slice())
  }

  _pushRegexp(gen, obj) {
    return gen._pushTag(TAG.REGEXP) && gen.pushAny(obj.source)
  }

  _pushSet(gen, obj) {
    if (!gen._pushInt(obj.size, MT.ARRAY)) {
      return false
    }
    for (const x of obj) {
      if (!gen.pushAny(x)) {
        return false
      }
    }
    return true
  }

  _pushUrl(gen, obj) {
    return gen._pushTag(TAG.URI) && gen.pushAny(obj.format())
  }

  _pushURL(gen, obj) {
    return gen._pushTag(TAG.URI) && gen.pushAny(obj.toString())
  }

  /**
   * @param {bignumber} obj
   * @private
   */
  _pushBigint(obj) {
    let m = MT.POS_INT
    let tag = TAG.POS_BIGINT

    if (obj.isNegative()) {
      obj = obj.negated().minus(1)
      m = MT.NEG_INT
      tag = TAG.NEG_BIGINT
    }

    if (this.collapseBigIntegers &&
        obj.lte(BN.MAXINT64)) {
      //  special handiling for 64bits
      if (obj.lte(BN.MAXINT32)) {
        return this._pushInt(obj.toNumber(), m)
      }
      return this._pushUInt8((m << 5) | NUMBYTES.EIGHT) &&
        this._pushUInt32BE(obj.dividedToIntegerBy(BN.SHIFT32).toNumber()) &&
        this._pushUInt32BE(obj.mod(BN.SHIFT32).toNumber())
    }
    let str = obj.toString(16)
    if (str.length % 2) {
      str = '0' + str
    }
    const buf = Buffer.from(str, 'hex')
    return this._pushTag(tag) && this._pushBuffer(this, buf)
  }

  /**
   * @param {bigint} obj
   * @private
   */
  _pushJSBigint(obj) {
    let m = MT.POS_INT
    let tag = TAG.POS_BIGINT
    // BigInt doesn't have -0
    if (obj < 0) {
      obj = -obj + BI.MINUS_ONE
      m = MT.NEG_INT
      tag = TAG.NEG_BIGINT
    }

    if (this.collapseBigIntegers &&
        (obj <= BI.MAXINT64)) {
      //  special handiling for 64bits
      if (obj <= 0xffffffff) {
        return this._pushInt(Number(obj), m)
      }
      return this._pushUInt8((m << 5) | NUMBYTES.EIGHT) &&
        this._pushUInt32BE(Number(obj / BI.SHIFT32)) &&
        this._pushUInt32BE(Number(obj % BI.SHIFT32))
    }

    let str = obj.toString(16)
    if (str.length % 2) {
      str = '0' + str
    }
    const buf = Buffer.from(str, 'hex')
    return this._pushTag(tag) && this._pushBuffer(this, buf)
  }

  _pushBigNumber(gen, obj) {
    if (obj.isNaN()) {
      return gen._pushNaN()
    }
    if (!obj.isFinite()) {
      return gen._pushInfinity(obj.isNegative() ? -Infinity : Infinity)
    }
    if (obj.isInteger()) {
      return gen._pushBigint(obj)
    }
    if (!(gen._pushTag(TAG.DECIMAL_FRAC) &&
      gen._pushInt(2, MT.ARRAY))) {
      return false
    }

    const dec = obj.decimalPlaces()
    const slide = obj.shiftedBy(dec)
    if (!gen._pushIntNum(-dec)) {
      return false
    }
    if (slide.abs().isLessThan(BN.MAXINT)) {
      return gen._pushIntNum(slide.toNumber())
    } else {
      return gen._pushBigint(slide)
    }
  }

  _pushMap(gen, obj, opts) {
    opts = Object.assign({
      indefinite: false
    }, opts)
    if (opts.indefinite) {
      if (!gen._pushUInt8((MT.MAP << 5) | NUMBYTES.INDEFINITE)) {
        return false
      }
    } else if (!gen._pushInt(obj.size, MT.MAP)) {
      return false
    }
    // memoizing the cbor only helps in certain cases, and hurts in most
    // others.  Just avoid it.
    if (gen.canonical) {
      // keep the key/value pairs together, so we don't have to do odd
      // gets with object keys later
      const entries = [...obj.entries()]
      const enc = new Encoder(this) // TODO: fix genTypes
      const bs = new NoFilter({highWaterMark:this.readableHighWaterMark})
      enc.pipe(bs)
      entries.sort(([a], [b]) => {
        // a, b are the keys
        enc.pushAny(a)
        const a_cbor = bs.read()
        enc.pushAny(b)
        const b_cbor = bs.read()
        return a_cbor.compare(b_cbor)
      })
      for (const [k, v] of entries) {
        if (gen.disallowUndefinedKeys && (typeof k === 'undefined')) {
          throw new Error('Invalid Map key: undefined')
        }
        if (!(gen.pushAny(k) && gen.pushAny(v))) {
          return false
        }
      }
    } else {
      for (const [k, v] of obj) {
        if (gen.disallowUndefinedKeys && (typeof k === 'undefined')) {
          throw new Error('Invalid Map key: undefined')
        }
        if (!(gen.pushAny(k) && gen.pushAny(v))) {
          return false
        }
      }
    }
    if (opts.indefinite) {
      if (!gen.push(BREAK)) {
        return false
      }
    }
    return true
  }

  _pushUint8Array(gen, obj) {
    return gen._pushBuffer(gen, Buffer.from(obj))
  }

  _pushFloat32Array(gen, obj) {
    const len = obj.length
    if (!gen._pushInt(len, MT.ARRAY)) {
      return false
    }
    for (let j = 0; j < len; j++) {
      if (!gen._pushUInt8(FLOAT) || !gen._pushFloatBE(obj[j])) {
        return false
      }
    }
    return true
  }

  _pushFloat64Array(gen, obj) {
    const len = obj.length
    if (!gen._pushInt(len, MT.ARRAY)) {
      return false
    }
    for (let j = 0; j < len; j++) {
      if (!gen._pushUInt8(DOUBLE) || !gen._pushDoubleBE(obj[j])) {
        return false
      }
    }
    return true
  }

  /**
   * Remove all of the loop detector additions to the given object.
   *
   * @param {Object} obj - object to clean
   * @returns {bool} - true when the object was cleaned, else false
   */
  removeLoopDetectors(obj) {
    if (!this.detectLoops) {
      return false
    }
    return Encoder.removeLoopDetectors(obj, this.detectLoops)
  }

  /**
   * Remove all of the loop detector additions to the given object.
   * The static version is easier to call when you don't have a full
   * encoder instance available; it uses a good heuristic to figure
   * out the loop detector symbol.
   *
   * @param {Object} obj - object to clean
   * @param {Symbol} [detector=null] - the symbol to clean, or null
   *   to use the first detected symbol
   * @returns {bool} - true when the object was cleaned, else false
   */
  static removeLoopDetectors(obj, detector=null) {
    if ((typeof(obj) !== 'object') || !obj) {
      return false
    }
    const dl = obj[LOOP_DETECT]
    if (!dl) {
      // ironically, use loop marking to detect loops on removal as well
      return false
    }
    if (detector == null) {
      detector = dl
    } else {
      if (detector !== dl) {
        return false
      }
    }
    delete obj[LOOP_DETECT]
    if (Array.isArray(obj)) {
      for (const i of obj) {
        this.removeLoopDetectors(i, detector)
      }
    } else {
      for (const k in obj) {
        this.removeLoopDetectors(obj[k], detector)
      }
    }
    return true
  }

  _pushObject(obj, opts) {
    if (!obj) {
      return this._pushNull(obj)
    }
    opts = Object.assign({
      indefinite: false,
      skipTypes: false
    }, opts)
    if (!opts.indefinite) {
      // this will only happen the first time through for indefinite encoding
      if (this.detectLoops) {
        if (obj[LOOP_DETECT] === this.detectLoops) {
          throw new Error('Loop detected while CBOR encoding')
        } else {
          obj[LOOP_DETECT] = this.detectLoops
        }
      }
    }
    if (!opts.skipTypes) {
      const f = obj.encodeCBOR
      if (typeof f === 'function') {
        return f.call(obj, this)
      }
      const converter = this.semanticTypes[obj.constructor.name]
      if (converter) {
        return converter.call(obj, this, obj)
      }
    }
    const keys = Object.keys(obj).filter(k => typeof obj[k] !== 'function')
    const cbor_keys = {}
    if (this.canonical) {
      // note: this can't be a normal sort, because 'b' needs to sort before
      // 'aa'
      keys.sort((a, b) => {
        // Always strings, so don't bother to pass options.
        // hold on to the cbor versions, since there's no need
        // to encode more than once
        const a_cbor = cbor_keys[a] || (cbor_keys[a] = Encoder.encode(a))
        const b_cbor = cbor_keys[b] || (cbor_keys[b] = Encoder.encode(b))

        return a_cbor.compare(b_cbor)
      })
    }
    if (opts.indefinite) {
      if (!this._pushUInt8((MT.MAP << 5) | NUMBYTES.INDEFINITE)) {
        return false
      }
    } else if (!this._pushInt(keys.length, MT.MAP)) {
      return false
    }
    let ck
    for (let j = 0, len2 = keys.length; j < len2; j++) {
      const k = keys[j]
      if (this.canonical && ((ck = cbor_keys[k]))) {
        if (!this.push(ck)) { // already a Buffer
          return false
        }
      } else {
        if (!this._pushString(k)) {
          return false
        }
      }
      if (!this.pushAny(obj[k])) {
        return false
      }
    }
    if (opts.indefinite) {
      if (!this.push(BREAK)) {
        return false
      }
    }
    return true
  }

  /**
   * Push any supported type onto the encoded stream
   *
   * @param {any} obj
   * @returns {boolean} true on success
   */
  pushAny(obj) {
    switch (typeof obj) {
      case 'number':
        return this._pushNumber(obj)
      case 'bigint':
        return this._pushJSBigint(obj)
      case 'string':
        return this._pushString(obj)
      case 'boolean':
        return this._pushBoolean(obj)
      case 'undefined':
        return this._pushUndefined(obj)
      case 'object':
        return this._pushObject(obj)
      case 'symbol':
        switch (obj) {
          case SYMS.NULL:
            return this._pushNull(null)
          case SYMS.UNDEFINED:
            return this._pushUndefined(void 0)
          // TODO: Add pluggable support for other symbols
          default:
            throw new Error('Unknown symbol: ' + obj.toString())
        }
      default:
        throw new Error(
          'Unknown type: ' + typeof obj + ', ' +
          (!!obj.toString ? obj.toString() : ''))
    }
  }

  /* backwards-compat wrapper */
  _pushAny(obj) {
    // TODO: write deprecation warning
    return this.pushAny(obj)
  }

  _encodeAll(objs) {
    const bs = new NoFilter({ highWaterMark:this.readableHighWaterMark })
    this.pipe(bs)
    for (const o of objs) {
      this.pushAny(o)
    }
    this.end()
    return bs.read()
  }

  /**
   * Encode the given object with indefinite length.  There are apparently
   * some (IMO) broken implementations of poorly-specified protocols that
   * REQUIRE indefinite-encoding.  Add this to an object or class as the
   * `encodeCBOR` function to get indefinite encoding:
   * @example
   * const o = {
   *   a: true,
   *   encodeCBOR: cbor.Encoder.encodeIndefinite
   * }
   * const m = []
   * m.encodeCBOR = cbor.Encoder.encodeIndefinite
   * cbor.encodeOne([o, m])
   *
   * @param {Encoder} - the encoder to use
   * @param {String|Buffer|Array|Map|Object} [obj] - the object to encode.  If
   *   null, use "this" instead.
   * @param {Object} [opts=null] - Options for encoding
   * @param {boolean} [opts.chunkSize=4096] - Number of characters or bytes
   *  for each chunk, if obj is a string or Buffer
   * @returns {boolean} - true on success
   */
  static encodeIndefinite(gen, obj, opts) {
    if (obj == null) {
      if (this == null) {
        throw new Error('No object to encode')
      }
      obj = this
    }
    opts = Object.assign({
      chunkSize: 4096
    }, opts)

    let ret = true
    const objType = typeof obj
    if (objType === 'string') {
      // TODO: make sure not to split surrogate pairs at the edges of chunks,
      // since such half-surrogates cannot be legally encoded as UTF-8.
      ret = ret && gen._pushUInt8((MT.UTF8_STRING << 5) | NUMBYTES.INDEFINITE)
      let offset = 0
      while (offset < obj.length) {
        const endIndex = offset + opts.chunkSize
        ret = ret && gen._pushString(obj.slice(offset, endIndex))
        offset = endIndex
      }
      ret = ret && gen.push(BREAK)
    } else if (Buffer.isBuffer(obj)) {
      ret = ret && gen._pushUInt8((MT.BYTE_STRING << 5) | NUMBYTES.INDEFINITE)
      let offset = 0
      while (offset < obj.length) {
        const endIndex = offset + opts.chunkSize
        ret = ret && gen._pushBuffer(gen, obj.slice(offset, endIndex))
        offset = endIndex
      }
      ret = ret && gen.push(BREAK)
    } else if (Array.isArray(obj)) {
      ret = ret && gen._pushArray(gen, obj, {
        indefinite: true
      })
    } else if (obj instanceof Map) {
      ret = ret && gen._pushMap(gen, obj, {
        indefinite: true
      })
    } else {
      if (objType !== 'object') {
        throw new Error('Invalid indefinite encoding')
      }
      ret = ret && gen._pushObject(obj, {
        indefinite: true,
        skipTypes: true
      })
    }
    return ret
  }

  /**
   * Encode one or more JavaScript objects, and return a Buffer containing the
   * CBOR bytes.
   *
   * @param {...any} objs - the objects to encode
   * @returns {Buffer} - the encoded objects
   */
  static encode(...objs) {
    return new Encoder()._encodeAll(objs)
  }

  /**
   * Encode one or more JavaScript objects canonically (slower!), and return
   * a Buffer containing the CBOR bytes.
   *
   * @param {...any} objs - the objects to encode
   * @returns {Buffer} - the encoded objects
   */
  static encodeCanonical(...objs) {
    return new Encoder({canonical: true})._encodeAll(objs)
  }

  /**
   * Encode one JavaScript object using the given options.
   *
   * @static
   * @param {any} obj - the object to encode
   * @param {Object?} options - passed to the Encoder constructor
   * @returns {Buffer} - the encoded objects
   */
  static encodeOne(obj, options) {
    return new Encoder(options)._encodeAll([obj])
  }

  /**
   * Encode one JavaScript object using the given options in a way that
   * is more resilient to objects being larger than the highWaterMark
   * number of bytes.  As with the other static encode functions, this 
   * will still use a large amount of memory.  Use a stream-based approach
   * directly if you need to process large and complicated inputs.
   *
   * @param {any} obj - the object to encode
   * @param {Object?} options - passed to the Encoder constructor
   */
  static encodeAsync(obj, options) {
    return new Promise((resolve, reject) => {
      const bufs = []
      const enc = new Encoder(options)
      enc.on('data', buf => bufs.push(buf))
      enc.on('error', reject)
      enc.on('finish', () => resolve(Buffer.concat(bufs)))
      enc.pushAny(obj)
      enc.end()
    })
  }
}

module.exports = Encoder
