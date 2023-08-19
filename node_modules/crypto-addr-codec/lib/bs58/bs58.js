/*!
bs58check - A straight forward implementation of base58check extending upon bs58.

The MIT License (MIT)
Copyright (c) 2017 Daniel Cousens

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

import Sha256 from '../sha256';
import base58 from 'bs58';

function sha256x2 (buffer) {
    var tmp = new Sha256().update(buffer).digest()
    return new Sha256().update(tmp).digest()
}

const bs58Check = function (checksumFn) {
    // Encode a buffer as a base58-check encoded string
    function encode (payload) {
        var checksum = checksumFn(payload)

        return base58.encode(Buffer.concat([
            payload,
            checksum
        ], payload.length + 4))
    }
    function decodeRaw (buffer) {
        var payload = buffer.slice(0, -4)
        var checksum = buffer.slice(-4)
        var newChecksum = checksumFn(payload)
        /* tslint:disable:no-bitwise */
        if (checksum[0] ^ newChecksum[0] |
            checksum[1] ^ newChecksum[1] |
            checksum[2] ^ newChecksum[2] |
            checksum[3] ^ newChecksum[3]) { return }

        return payload
    }
    // Decode a base58-check encoded string to a buffer, no result if checksum is wrong
    function decodeUnsafe (data) {
        var buffer = base58.decodeUnsafe(data)
        if (!buffer) { return }

        return decodeRaw(buffer)
    }
    function decode (data) {
        var buffer = base58.decode(data)
        var payload = decodeRaw(buffer, checksumFn)
        if (!payload) { throw new Error('Invalid checksum') }
        return payload
    }
    return { bs58Encode: encode, bs58Decode: decode, decodeUnsafe: decodeUnsafe }
};

const bs58 = bs58Check(sha256x2);

export const { bs58Decode, bs58Encode, decodeUnsafe } = bs58;

export default bs58;
