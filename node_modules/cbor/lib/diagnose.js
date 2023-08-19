'use strict'

const stream = require('stream')
const util = require('util')
const Decoder = require('./decoder')
const Simple = require('./simple')
const utils = require('./utils')
const constants = require('./constants')
const bignumber = require('bignumber.js').BigNumber
const NoFilter = require('nofilter')

const MT = constants.MT
const SYMS = constants.SYMS

/**
 * Output the diagnostic format from a stream of CBOR bytes.
 *
 * @extends {stream.Transform}
 */
class Diagnose extends stream.Transform {

  /**
   * Creates an instance of Diagnose.
   *
   * @param {Object} [options={}] - options for creation
   * @param {string} [options.separator='\n'] - output between detected objects
   * @param {boolean} [options.stream_errors=false] - put error info into the
   *   output stream
   * @param {number} [options.max_depth=-1] - -1 for "until you run out of
   *   memory".  Set this to a finite positive number for un-trusted inputs.
   *   Most standard inputs won't nest more than 100 or so levels; I've tested
   *   into the millions before running out of memory.
   */
  constructor(options) {
    const opts = Object.assign({
      separator: '\n',
      stream_errors: false
    }, options, {
      readableObjectMode: false,
      writableObjectMode: false
    })
    const separator = opts.separator
    delete opts.separator
    const stream_errors = opts.stream_errors
    delete opts.stream_errors
    super(opts)

    this.float_bytes = -1
    this.separator = separator
    this.stream_errors = stream_errors
    this.parser = new Decoder(opts)
    this.parser.on('more-bytes', this._on_more.bind(this))
    this.parser.on('value', this._on_value.bind(this))
    this.parser.on('start', this._on_start.bind(this))
    this.parser.on('stop', this._on_stop.bind(this))
    this.parser.on('data', this._on_data.bind(this))
    this.parser.on('error', this._on_error.bind(this))
  }

  _transform(fresh, encoding, cb) {
    return this.parser.write(fresh, encoding, cb)
  }

  _flush(cb) {
    return this.parser._flush((er) => {
      if (this.stream_errors) {
        if (er) {
          this._on_error(er)
        }
        return cb()
      } else {
        return cb(er)
      }
    })
  }

  /**
   * Convenience function to return a string in diagnostic format.
   *
   * @param {(Buffer|string)} input - the CBOR bytes to format
   * @param {string} [encoding='hex'] - the encoding of input, ignored if
   *   input is Buffer
   * @param {function(Error, string): undefined} cb - callback
   * @returns {Promise} if callback not specified
   */
  static diagnose(input, encoding, cb) {
    if (input == null) {
      throw new Error('input required')
    }
    let opts = {}
    let encod = 'hex'
    switch (typeof encoding) {
      case 'function':
        cb = encoding
        encod = utils.guessEncoding(input)
        break
      case 'object':
        opts = utils.extend({}, encoding)
        encod = (opts.encoding != null) ?
          opts.encoding : utils.guessEncoding(input)
        delete opts.encoding
        break
      default:
        encod = (encoding != null) ? encoding : 'hex'
    }
    const bs = new NoFilter()
    const d = new Diagnose(opts)
    let p = null
    if (typeof cb === 'function') {
      d.on('end', () => cb(null, bs.toString('utf8')))
      d.on('error', cb)
    } else {
      p = new Promise((resolve, reject) => {
        d.on('end', () => resolve(bs.toString('utf8')))
        return d.on('error', reject)
      })
    }
    d.pipe(bs)
    d.end(input, encod)
    return p
  }

  _on_error(er) {
    if (this.stream_errors) {
      return this.push(er.toString())
    } else {
      return this.emit('error', er)
    }
  }

  _on_more(mt, len, parent_mt, pos) {
    if (mt === MT.SIMPLE_FLOAT) {
      return this.float_bytes = {
        2: 1,
        4: 2,
        8: 3
      }[len]
    }
  }

  _fore(parent_mt, pos) {
    switch (parent_mt) {
      case MT.BYTE_STRING:
      case MT.UTF8_STRING:
      case MT.ARRAY:
        if (pos > 0) {
          return this.push(', ')
        }
        break
      case MT.MAP:
        if (pos > 0) {
          if (pos % 2) {
            return this.push(': ')
          } else {
            return this.push(', ')
          }
        }
    }
  }

  _on_value(val, parent_mt, pos) {
    if (val === SYMS.BREAK) {
      return
    }
    this._fore(parent_mt, pos)
    return this.push((() => {
      switch (false) {
        case val !== SYMS.NULL:
          return 'null'
        case val !== SYMS.UNDEFINED:
          return 'undefined'
        case typeof val !== 'string':
          return JSON.stringify(val)
        case !(this.float_bytes > 0):
          const fb = this.float_bytes
          this.float_bytes = -1
          return (util.inspect(val)) + '_' + fb
        case !Buffer.isBuffer(val):
          return 'h\'' + (val.toString('hex')) + '\''
        case !(val instanceof bignumber):
          return val.toString()
        default:
          return util.inspect(val)
      }
    })())
  }

  _on_start(mt, tag, parent_mt, pos) {
    this._fore(parent_mt, pos)
    switch (mt) {
      case MT.TAG:
        this.push(`${tag}(`)
        break
      case MT.ARRAY:
        this.push('[')
        break
      case MT.MAP:
        this.push('{')
        break
      case MT.BYTE_STRING:
      case MT.UTF8_STRING:
        this.push('(')
        break
    }
    if (tag === SYMS.STREAM) {
      return this.push('_ ')
    }
  }

  _on_stop(mt) {
    switch (mt) {
      case MT.TAG:
        return this.push(')')
      case MT.ARRAY:
        return this.push(']')
      case MT.MAP:
        return this.push('}')
      case MT.BYTE_STRING:
      case MT.UTF8_STRING:
        return this.push(')')
    }
  }

  _on_data() {
    return this.push(this.separator)
  }
}

module.exports = Diagnose
