'use strict'

const bignumber = require('bignumber.js').BigNumber
const utils = require('./utils')
const url = require('url')

const MINUS_ONE = new bignumber(-1)
const TWO = new bignumber(2)

/**
 * A CBOR tagged item, where the tag does not have semantics specified at the
 * moment, or those semantics threw an error during parsing. Typically this will
 * be an extension point you're not yet expecting.
 */
class Tagged {

  /**
   * Creates an instance of Tagged.
   *
   * @param {number} tag - the number of the tag
   * @param {any} value - the value inside the tag
   * @param {Error} [err] - the error that was thrown parsing the tag, or null
   */
  constructor(tag, value, err) {
    this.tag = tag
    this.value = value
    this.err = err
    if (typeof this.tag !== 'number') {
      throw new Error('Invalid tag type (' + (typeof this.tag) + ')')
    }
    if ((this.tag < 0) || ((this.tag | 0) !== this.tag)) {
      throw new Error('Tag must be a positive integer: ' + this.tag)
    }
  }

  /**
   * Convert to a String
   *
   * @returns {string} string of the form '1(2)'
   */
  toString() {
    return `${this.tag}(${JSON.stringify(this.value)})`
  }

  /**
   * Push the simple value onto the CBOR stream
   *
   * @param {Object} gen The generator to push onto
   */
  encodeCBOR(gen) {
    gen._pushTag(this.tag)
    return gen.pushAny(this.value)
  }

  /**
   * If we have a converter for this type, do the conversion.  Some converters
   * are built-in.  Additional ones can be passed in.  If you want to remove
   * a built-in converter, pass a converter in whose value is 'null' instead
   * of a function.
   *
   * @param {Object} converters - keys in the object are a tag number, the value
   *   is a function that takes the decoded CBOR and returns a JavaScript value
   *   of the appropriate type.  Throw an exception in the function on errors.
   * @returns {any} - the converted item
   */
  convert(converters) {
    let f = converters != null ? converters[this.tag] : void 0
    if (typeof f !== 'function') {
      f = Tagged['_tag_' + this.tag]
      if (typeof f !== 'function') {
        return this
      }
    }
    try {
      return f.call(Tagged, this.value)
    } catch (error) {
      this.err = error
      return this
    }
  }

  static _tag_0(v) {
    return new Date(v)
  }

  static _tag_1(v) {
    return new Date(v * 1000)
  }

  static _tag_2(v) {
    return utils.bufferToBignumber(v)
  }

  static _tag_3(v) {
    return MINUS_ONE.minus(utils.bufferToBignumber(v))
  }

  static _tag_4(v) {
    return bignumber(v[1]).shiftedBy(v[0])
  }

  static _tag_5(v) {
    return TWO.pow(v[0]).times(v[1])
  }

  static _tag_32(v) {
    return url.parse(v)
  }

  static _tag_35(v) {
    return new RegExp(v)
  }
}

module.exports = Tagged
