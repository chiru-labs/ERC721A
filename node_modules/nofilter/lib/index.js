'use strict'

const stream = require('stream')
const util = require('util')

/**
 * NoFilter stream.  Can be used to sink or source data to and from
 * other node streams.  Implemented as the "identity" Transform stream
 * (hence the name), but allows for inspecting data that is in-flight.
 *
 * Allows passing in source data (input, inputEncoding) at creation
 * time.  Source data can also be passed in the options object.
 *
 * @example <caption>source</caption>
 * const n = new NoFilter('Zm9v', 'base64');
 * n.pipe(process.stdout);
 *
 * @example <caption>sink</caption>
 * const n = new Nofilter();
 * // NOTE: 'finish' fires when the input is done writing
 * n.on('finish', function() { console.log(n.toString('base64')); });
 * process.stdin.pipe(n);
 */
class NoFilter extends stream.Transform {
  /**
   * Create an instance of NoFilter.
   *
   * @param {string|Buffer} [input] - Source data
   * @param {string} [inputEncoding=null] - Encoding name for input,
   *   ignored if input is not a String
   * @param {Object} [options={}] - Other options
   * @param {string|Buffer} [options.input=null] - Input source data
   * @param {string} [options.inputEncoding=null] - Encoding name for input,
   *   ignored if input is not a String
   * @param {number} [options.highWaterMark=16384] - The maximum number of bytes
   *   to store in the internal buffer before ceasing to read from the
   *   underlying resource. Default=16kb, or 16 for objectMode streams
   * @param {string} [options.encoding=null] - If specified, then buffers will
   *   be decoded to strings using the specified encoding
   * @param {boolean} [options.objectMode=false] - Whether this stream should
   *   behave as a stream of objects. Meaning that stream.read(n) returns a
   *   single value instead of a Buffer of size n
   * @param {boolean} [options.decodeStrings=true] - Whether or not to decode
   *   strings into Buffers before passing them to _write()
   * @param {boolean} [options.watchPipe=true] - Whether to watch for 'pipe'
   *   events, setting this stream's objectMode based on the objectMode of the
   *   input stream
   * @param {boolean} [options.readError=false] - If true, when a read()
   *   underflows, throw an error.
   */
  constructor(input, inputEncoding, options) {
    if (options == null) {
      options = {}
    }
    let inp
    let inpE
    switch (typeof(input)) {
      case 'object':
        if (Buffer.isBuffer(input)) {
          inp = input
          if ((inputEncoding != null) && (typeof(inputEncoding) === 'object')) {
            options = inputEncoding
          }
        } else {
          options = input
        }
        break
      case 'string':
        inp = input
        if ((inputEncoding != null) && (typeof(inputEncoding) === 'object')) {
          options = inputEncoding
        } else {
          inpE = inputEncoding
        }
        break
    }

    if ((options == null)) {
      options = {}
    }
    if (inp == null) {
      inp = options.input
    }
    if (inpE == null) {
      inpE = options.inputEncoding
    }
    delete options.input
    delete options.inputEncoding
    const watchPipe = options.watchPipe != null ? options.watchPipe : true
    delete options.watchPipe
    const readError = !! options.readError
    delete options.readError
    super(options)

    this.readError = readError

    if (watchPipe) {
      this.on('pipe', readable => {
        const om = readable._readableState.objectMode
        if ((this.length > 0) && (om !== this._readableState.objectMode)) {
          throw new Error(
            'Do not switch objectMode in the middle of the stream')
        }

        this._readableState.objectMode = om
        return this._writableState.objectMode = om
      })
    }

    if (inp != null) {
      this.end(inp, inpE)
    }
  }

  /**
   * Is the given object a {NoFilter}?
   *
   * @param {Object} obj The object to test.
   * @returns {boolean} true if obj is a NoFilter
   */
  static isNoFilter(obj) {
    return obj instanceof this
  }

  /**
   * The same as nf1.compare(nf2). Useful for sorting an Array of NoFilters.
   *
   * @param {NoFilter} nf1 - The first object to compare
   * @param {NoFilter} nf2 - The second object to compare
   * @returns {number} -1, 0, 1 for less, equal, greater
   *
   * @example
   * const arr = [new NoFilter('1234'), new NoFilter('0123')];
   * arr.sort(NoFilter.compare);
   */
  static compare(nf1, nf2) {
    if (!(nf1 instanceof this)) {
      throw new TypeError('Arguments must be NoFilters')
    }
    if (nf1 === nf2) {
      return 0
    } else {
      return nf1.compare(nf2)
    }
  }

  /**
   * Returns a buffer which is the result of concatenating all the
   * NoFilters in the list together. If the list has no items, or if
   * the totalLength is 0, then it returns a zero-length buffer.
   *
   * If length is not provided, it is read from the buffers in the
   * list. However, this adds an additional loop to the function, so
   * it is faster to provide the length explicitly if you already know it.
   *
   * @param {Array<NoFilter>} list Inputs.  Must not be all either in object
   *   mode, or all not in object mode.
   * @param {number} [length=null] Number of bytes or objects to read
   * @returns {Buffer|Array} The concatenated values as an array if in object
   *   mode, otherwise a Buffer
   */
  static concat(list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('list argument must be an Array of NoFilters')
    }
    if ((list.length === 0) || (length === 0)) {
      return Buffer.alloc(0)
    }
    if ((length == null)) {
      length = list.reduce((tot, nf) => {
        if (!(nf instanceof NoFilter)) {
          throw new TypeError('list argument must be an Array of NoFilters')
        }
        return tot + nf.length
      }, 0)
    }
    let allBufs = true
    let allObjs = true
    const bufs = list.map(nf => {
      if (!(nf instanceof NoFilter)) {
        throw new TypeError('list argument must be an Array of NoFilters')
      }
      const buf = nf.slice()
      if (Buffer.isBuffer(buf)) {
        allObjs = false
      } else {
        allBufs = false
      }
      return buf
    })
    if (allBufs) {
      return Buffer.concat(bufs, length)
    }
    if (allObjs) {
      return [].concat(...bufs).slice(0, length)
    }
    // TODO: maybe coalesce buffers, counting bytes, and flatten in arrays
    // counting objects?  I can't imagine why that would be useful.
    throw new Error('Concatenating mixed object and byte streams not supported')
  }

  /**
   * @private
   */
  _transform(chunk, encoding, callback) {
    if (!this._readableState.objectMode && !Buffer.isBuffer(chunk)) {
      chunk = Buffer.from(chunk, encoding)
    }
    this.push(chunk)
    callback()
  }

  /**
   * @private
   */
  _bufArray() {
    let bufs = this._readableState.buffer
    // HACK: replace with something else one day.  This is what I get for
    // relying on internals.
    if (!Array.isArray(bufs)) {
      let b = bufs.head
      bufs = []
      while (b != null) {
        bufs.push(b.data)
        b = b.next
      }
    }
    return bufs
  }

  /**
   * Pulls some data out of the internal buffer and returns it.
   * If there is no data available, then it will return null.
   *
   * If you pass in a size argument, then it will return that many bytes. If
   * size bytes are not available, then it will return null, unless we've
   * ended, in which case it will return the data remaining in the buffer.
   *
   * If you do not specify a size argument, then it will return all the data in
   * the internal buffer.
   *
   * @param {number} [size=null] - Number of bytes to read.
   * @returns {string|Buffer|null} If no data or not enough data, null.  If
   *   decoding output a string, otherwise a Buffer
   * @throws Error - if readError is true and there was underflow
   * @fires NoFilter#read
   */
  read(size) {
    const buf = super.read(size)
    if (buf != null) {
      /*
       * Read event. Fired whenever anything is read from the stream.
       *
       * @event NoFilter#read
       * @type {Buffer|string|Object}
       *
       */
      this.emit('read', buf)
      if (this.readError && (buf.length < size)) {
        throw new Error(`Read ${buf.length}, wanted ${size}`)
      }
    } else if (this.readError) {
      throw new Error(`No data available, wanted ${size}`)
    }
    return buf
  }

  /**
   * Return a promise fulfilled with the full contents, after the 'finish'
   * event fires.  Errors on the stream cause the promise to be rejected.
   *
   * @param {function} [cb=null] - finished/error callback used in *addition*
   *   to the promise
   * @returns {Promise<Buffer|String>} fulfilled when complete
   */
  promise(cb) {
    let done = false
    return new Promise((resolve, reject) => {
      this.on('finish', () => {
        const data = this.read()
        if ((cb != null) && !done) {
          done = true
          cb(null, data)
        }
        resolve(data)
      })
      this.on('error', (er) => {
        if ((cb != null) && !done) {
          done = true
          cb(er)
        }
        reject(er)
      })
    })
  }

  /**
   * Returns a number indicating whether this comes before or after or is the
   * same as the other NoFilter in sort order.
   *
   * @param {NoFilter} other - The other object to compare
   * @returns {Number} -1, 0, 1 for less, equal, greater
   */
  compare(other) {
    if (!(other instanceof NoFilter)) {
      throw new TypeError('Arguments must be NoFilters')
    }
    if (this === other) {
      return 0
    } else {
      const buf1 = this.slice()
      const buf2 = other.slice()
      // these will both be buffers because of the check above.
      if (Buffer.isBuffer(buf1) && Buffer.isBuffer(buf2)) {
        return buf1.compare(buf2)
      }
      throw new Error('Cannot compare streams in object mode')
    }
  }

  /**
   * Do these NoFilter's contain the same bytes?  Doesn't work if either is
   * in object mode.
   *
   * @param {NoFilter} other
   * @returns {boolean} Equal?
   */
  equals(other) {
    return this.compare(other) === 0
  }

  /**
   * Read bytes or objects without consuming them.  Useful for diagnostics.
   * Note: as a side-effect, concatenates multiple writes together into what
   * looks like a single write, so that this concat doesn't have to happen
   * multiple times when you're futzing with the same NoFilter.
   *
   * @param {Number} [start=0] - beginning offset
   * @param {Number} [end=length] - ending offset
   * @returns {Buffer|Array} if in object mode, an array of objects.  Otherwise,
   *   concatenated array of contents.
   */
  slice(start, end) {
    if (this._readableState.objectMode) {
      return this._bufArray().slice(start, end)
    }
    const bufs = this._bufArray()
    switch (bufs.length) {
      case 0: return Buffer.alloc(0)
      case 1: return bufs[0].slice(start, end)
      default:
        const b = Buffer.concat(bufs)
        // TODO: store the concatented bufs back
        // @_readableState.buffer = [b]
        return b.slice(start, end)
    }
  }

  /**
    * Get a byte by offset.  I didn't want to get into metaprogramming
    * to give you the `NoFilter[0]` syntax.
    *
    * @param {Number} index - The byte to retrieve
    * @returns {Number} 0-255
    */
  get(index) {
    return this.slice()[index]
  }

  /**
   * Return an object compatible with Buffer's toJSON implementation, so
   * that round-tripping will produce a Buffer.
   *
   * @returns {Object}
   *
   * @example output for 'foo'
   *   { type: 'Buffer', data: [ 102, 111, 111 ] }
   */
  toJSON() {
    const b = this.slice()
    if (Buffer.isBuffer(b)) {
      return b.toJSON()
    } else {
      return b
    }
  }

  /**
   * Decodes and returns a string from buffer data encoded using the specified
   * character set encoding. If encoding is undefined or null, then encoding
   * defaults to 'utf8'. The start and end parameters default to 0 and
   * NoFilter.length when undefined.
   *
   * @param {String} [encoding='utf8'] - Which to use for decoding?
   * @param {Number} [start=0] - Start offset
   * @param {Number} [end=length] - End offset
   * @returns {String}
   */
  toString(encoding, start, end) {
    const buf = this.slice(start, end)
    if (!Buffer.isBuffer(buf)) {
      return JSON.stringify(buf)
    }
    if ((!encoding || (encoding === 'utf8')) && util.TextDecoder) {
      const td = new util.TextDecoder('utf8', {
        fatal: true,
        ignoreBOM: true
      })
      return td.decode(buf)
    }
    return buf.toString(encoding, start, end)
  }

  /**
   * @private
   * @deprecated
   */
  inspect(depth, options) {
    return this[util.inspect.custom](depth, options)
  }

  /**
   * @private
   */
  [util.inspect.custom](depth, options) {
    const bufs = this._bufArray()
    const hex = bufs.map((b) => {
      if (Buffer.isBuffer(b)) {
        if ((options != null ? options.stylize : undefined)) {
          return options.stylize(b.toString('hex'), 'string')
        } else {
          return b.toString('hex')
        }
      } else {
        return util.inspect(b, options)
      }
    }).join(', ')
    return `${this.constructor.name} [${hex}]`
  }

  /**
   * Current readable length, in bytes.
   *
   * @member {number}
   * @readonly
   */
  get length() {
    return this._readableState.length
  }

  /**
   * Write a JavaScript BigInt to the stream.  Negative numbers will be
   * written as their 2's complement version.
   *
   * @param {bigint} val - The value to write
   * @returns {boolean} true on success
   */
  writeBigInt(val) {
    let str = val.toString(16)
    if (val < 0) {
      // two's complement
      // Note: str always starts with '-' here.
      const sz = BigInt(Math.floor(str.length / 2))
      const mask = BigInt(1) << (sz * BigInt(8))
      val = mask + val
      str = val.toString(16)
    }
    if (str.length % 2) {
      str = '0' + str
    }
    return this.push(Buffer.from(str, 'hex'))
  }

  /**
   * Read a variable-sized JavaScript unsigned BigInt from the stream.
   *
   * @param {number}  [len=null] - number of bytes to read or all remaining
   *   if null
   * @returns {bigint}
   */
  readUBigInt(len) {
    const b = this.read(len)
    if (!Buffer.isBuffer(b)) {
      return null
    }
    return BigInt('0x' + b.toString('hex'))
  }

  /**
   * Read a variable-sized JavaScript signed BigInt from the stream in 2's
   * complement format.
   *
   * @param {number} [len=null] - number of bytes to read or all remaining
   *   if null
   * @returns {bigint}
   */
  readBigInt(len) {
    const b = this.read(len)
    if (!Buffer.isBuffer(b)) {
      return null
    }
    let ret = BigInt('0x' + b.toString('hex'))
    // negative?
    if (b[0] & 0x80) {
      // two's complement
      const mask = BigInt(1) << (BigInt(b.length) * BigInt(8))
      ret = ret - mask
    }
    return ret
  }
}

/**
 * @param {string} meth - method to call
 * @param {number} len - number of bytes to write
 * @private
 */
function _read_gen(meth, len) {
  return function(val) {
    const b = this.read(len)
    if (!Buffer.isBuffer(b)) {
      return null
    }
    return b[meth].call(b, 0, true)
  }
}

/**
 * @param {string} meth - method to call
 * @param {number} len - number of bytes to write
 * @private
 */
function _write_gen(meth, len) {
  return function(val) {
    const b = Buffer.alloc(len)
    b[meth].call(b, val, 0, true)
    return this.push(b)
  }
}

Object.assign(NoFilter.prototype, {
  /**
   * Write an 8-bit unsigned integer to the stream.  Adds 1 byte.
   *
   * @function writeUInt8
   * @memberOf NoFilter
   * @instance
   * @param {Number} value - 0-255
   * @returns {boolean} true on success
   */
  writeUInt8: _write_gen('writeUInt8', 1),

  /**
   * Write a little-endian 16-bit unsigned integer to the stream.  Adds
   * 2 bytes.
   *
   * @function writeUInt16LE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeUInt16LE: _write_gen('writeUInt16LE', 2),

  /**
   * Write a big-endian 16-bit unsigned integer to the stream.  Adds
   * 2 bytes.
   *
   * @function writeUInt16BE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeUInt16BE: _write_gen('writeUInt16BE', 2),

  /**
   * Write a little-endian 32-bit unsigned integer to the stream.  Adds
   * 4 bytes.
   *
   * @function writeUInt32LE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeUInt32LE: _write_gen('writeUInt32LE', 4),

  /**
   * Write a big-endian 32-bit unsigned integer to the stream.  Adds
   * 4 bytes.
   *
   * @function writeUInt32BE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeUInt32BE: _write_gen('writeUInt32BE', 4),

  /**
   * Write a signed 8-bit integer to the stream.  Adds 1 byte.
   *
   * @function writeInt8
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeInt8: _write_gen('writeInt8', 1),

  /**
   * Write a signed little-endian 16-bit integer to the stream.  Adds 2 bytes.
   *
   * @function writeInt16LE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeInt16LE: _write_gen('writeInt16LE', 2),

  /**
   * Write a signed big-endian 16-bit integer to the stream.  Adds 2 bytes.
   *
   * @function writeInt16BE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeInt16BE: _write_gen('writeInt16BE', 2),

  /**
   * Write a signed little-endian 32-bit integer to the stream.  Adds 4 bytes.
   *
   * @function writeInt32LE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeInt32LE: _write_gen('writeInt32LE', 4),

  /**
   * Write a signed big-endian 32-bit integer to the stream.  Adds 4 bytes.
   *
   * @function writeInt32BE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeInt32BE: _write_gen('writeInt32BE', 4),

  /**
   * Write a little-endian 32-bit float to the stream.  Adds 4 bytes.
   *
   * @function writeFloatLE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeFloatLE: _write_gen('writeFloatLE', 4),

  /**
   * Write a big-endian 32-bit float to the stream.  Adds 4 bytes.
   *
   * @function writeFloatBE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeFloatBE: _write_gen('writeFloatBE', 4),

  /**
   * Write a little-endian 64-bit float to the stream.  Adds 8 bytes.
   *
   * @function writeDoubleLE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeDoubleLE: _write_gen('writeDoubleLE', 8),

  /**
   * Write a big-endian 64-bit float to the stream.  Adds 8 bytes.
   *
   * @function writeDoubleBE
   * @memberOf NoFilter
   * @instance
   * @param {Number} value
   * @returns {boolean} true on success
   */
  writeDoubleBE: _write_gen('writeDoubleBE', 8),

  /**
   * Read an unsigned 8-bit integer from the stream.  Consumes 1 byte.
   *
   * @function readUInt8
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readUInt8: _read_gen('readUInt8', 1),

  /**
   * Read a little-endian unsigned 16-bit integer from the stream.
   * Consumes 2 bytes.
   *
   * @function readUInt16LE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readUInt16LE: _read_gen('readUInt16LE', 2),

  /**
   * Read a big-endian unsigned 16-bit integer from the stream.
   * Consumes 2 bytes.
   *
   * @function readUInt16BE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readUInt16BE: _read_gen('readUInt16BE', 2),

  /**
   * Read a little-endian unsigned 32-bit integer from the stream.
   * Consumes 4 bytes.
   *
   * @function readUInt32LE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readUInt32LE: _read_gen('readUInt32LE', 4),

  /**
   * Read a big-endian unsigned 16-bit integer from the stream.
   * Consumes 4 bytes.
   *
   * @function readUInt32BE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readUInt32BE: _read_gen('readUInt32BE', 4),

  /**
   * Read a signed 8-bit integer from the stream.
   * Consumes 1 byte.
   *
   * @function readInt8
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readInt8: _read_gen('readInt8', 1),

  /**
   * Read a signed 16-bit little-endian integer from the stream.
   * Consumes 2 bytes.
   *
   * @function readInt16LE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readInt16LE: _read_gen('readInt16LE', 2),

  /**
   * Read a signed 16-bit big-endian integer from the stream.
   * Consumes 2 bytes.
   *
   * @function readInt16BE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readInt16BE: _read_gen('readInt16BE', 2),

  /**
   * Read a signed 32-bit little-endian integer from the stream.
   * Consumes 4 bytes.
   *
   * @function readInt32LE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readInt32LE: _read_gen('readInt32LE', 4),

  /**
   * Read a signed 32-bit big-endian integer from the stream.
   * Consumes 4 bytes.
   *
   * @function readInt32BE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readInt32BE: _read_gen('readInt32BE', 4),

  /**
   * Read a 32-bit little-endian float from the stream.
   * Consumes 4 bytes.
   *
   * @function readFloatLE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readFloatLE: _read_gen('readFloatLE', 4),

  /**
   * Read a 32-bit big-endian float from the stream.
   * Consumes 4 bytes.
   *
   * @function readFloatBE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readFloatBE: _read_gen('readFloatBE', 4),

  /**
   * Read a 64-bit little-endian float from the stream.
   * Consumes 8 bytes.
   *
   * @function readDoubleLE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readDoubleLE: _read_gen('readDoubleLE', 8),

  /**
   * Read a 64-bit big-endian float from the stream.
   * Consumes 8 bytes.
   *
   * @function readDoubleBE
   * @memberOf NoFilter
   * @instance
   * @returns {Number} value
   */
  readDoubleBE: _read_gen('readDoubleBE', 8)
})

module.exports = NoFilter
