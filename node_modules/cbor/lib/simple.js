'use strict'

const util = require('util')
const constants = require('./constants')
const MT = constants.MT
const SIMPLE = constants.SIMPLE
const SYMS = constants.SYMS

/**
 * A CBOR Simple Value that does not map onto a known constant.
 */
class Simple {
  /**
   * Creates an instance of Simple.
   *
   * @param {number} value - the simple value's integer value
   */
  constructor(value) {
    if (typeof value !== 'number') {
      throw new Error('Invalid Simple type: ' + (typeof value))
    }
    if ((value < 0) || (value > 255) || ((value|0) !== value)) {
      throw new Error('value must be a small positive integer: ' + value)
    }
    this.value = value
  }

  /**
   * Debug string for simple value
   *
   * @returns {string} simple(value)
   */
  toString() {
    return 'simple(' + this.value + ')'
  }

  /**
   * Debug string for simple value
   *
   * @returns {string} simple(value)
   */
  [util.inspect.custom](depth, opts) {
    return 'simple(' + this.value + ')'
  }

  /**
   * Debug string for simple value (backward-compatibility version)
   *
   * @returns {string} simple(value)
   */
  inspect(depth, opts) {
    return 'simple(' + this.value + ')'
  }

  /**
   * Push the simple value onto the CBOR stream
   *
   * @param {Object} gen The generator to push onto
   */
  encodeCBOR(gen) {
    return gen._pushInt(this.value, MT.SIMPLE_FLOAT)
  }

  /**
   * Is the given object a Simple?
   *
   * @param {any} obj - object to test
   * @returns {boolean} - is it Simple?
   */
  static isSimple(obj) {
    return obj instanceof Simple
  }

  /**
   * Decode from the CBOR additional information into a JavaScript value.
   * If the CBOR item has no parent, return a "safe" symbol instead of
   * `null` or `undefined`, so that the value can be passed through a
   * stream in object mode.
   *
   * @param {number} val - the CBOR additional info to convert
   * @param {boolean} [has_parent=true] - Does the CBOR item have a parent?
   * @param {boolean} [parent_indefinite=false] - Is the parent element
   *   indefinitely encoded?
   * @returns {(null|undefined|boolean|Symbol|Simple)} - the decoded value
   */
  static decode(val, has_parent=true, parent_indefinite=false) {
    switch (val) {
      case SIMPLE.FALSE:
        return false
      case SIMPLE.TRUE:
        return true
      case SIMPLE.NULL:
        if (has_parent) {
          return null
        } else {
          return SYMS.NULL
        }
      case SIMPLE.UNDEFINED:
        if (has_parent) {
          return void 0
        } else {
          return SYMS.UNDEFINED
        }
      case -1:
        if (!has_parent || !parent_indefinite) {
          throw new Error('Invalid BREAK')
        }
        return SYMS.BREAK
      default:
        return new Simple(val)
    }
  }
}

module.exports = Simple
