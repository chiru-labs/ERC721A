const alphabet = '13456789abcdefghijkmnopqrstuwxyz'

/**
 * Encode provided Uint8Array using the Nano-specific Base-32 implementeation.
 * @param {Uint8Array} view Input buffer formatted as a Uint8Array
 * @returns {string}
 */
function encode (view) {
  if (view.constructor !== Uint8Array) {
    throw new Error('View must be a Uint8Array!')
  }
  const length = view.length
  const leftover = (length * 8) % 5
  const offset = leftover === 0 ? 0 : 5 - leftover

  let value = 0
  let output = ''
  let bits = 0

  for (var i = 0; i < length; i++) {
    value = (value << 8) | view[i]
    bits += 8

    while (bits >= 5) {
      output += alphabet[(value >>> (bits + offset - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - (bits + offset))) & 31]
  }

  return output
}

function readChar (char) {
  var idx = alphabet.indexOf(char)

  if (idx === -1) {
    throw new Error('Invalid character found: ' + char)
  }

  return idx
}

/**
 * Decodes a Nano-implementation Base32 encoded string into a Uint8Array
 * @param {string} input A Nano-Base32 encoded string
 * @returns {Uint8Array}
 */
function decode (input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string!')
  }
  var length = input.length
  const leftover = (length * 5) % 8
  const offset = leftover === 0 ? 0 : 8 - leftover

  var bits = 0
  var value = 0

  var index = 0
  var output = new Uint8Array(Math.ceil(length * 5 / 8))

  for (var i = 0; i < length; i++) {
    value = (value << 5) | readChar(input[i])
    bits += 5

    if (bits >= 8) {
      output[index++] = (value >>> (bits + offset - 8)) & 255
      bits -= 8
    }
  }
  if (bits > 0) {
    output[index++] = (value << (bits + offset - 8)) & 255
  }

  if (leftover !== 0) {
    output = output.slice(1)
  }
  return output
}

module.exports = {
  encode,
  decode
}
