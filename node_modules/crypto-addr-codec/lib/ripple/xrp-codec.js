/*!

ripple-address-codec - encodes/decodes base58 encoded XRP Ledger identifiers.

Copyright (c) Ripple

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD
TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL
DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN
AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION
WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/

import baseCodec from 'base-x';
import Sha256 from '../sha256';
import { seqEqual, concatArgs } from './utils';

class Codec {
    constructor(options) {
        this.sha256 = options.sha256;
        this.alphabet = options.alphabet;
        this.codec = baseCodec(this.alphabet);
        this.base = this.alphabet.length;
    }
    encodeChecked(buffer) {
        const check = this.sha256(this.sha256(buffer)).slice(0, 4);
        return this.encodeRaw(Buffer.from(concatArgs(buffer, check)));
    }
    encodeRaw(bytes) {
        return this.codec.encode(bytes);
    }
    decodeChecked(base58string) {
        const buffer = this.decodeRaw(base58string);
        if (buffer.length < 5) {
            throw new Error('invalid_input_size: decoded data must have length >= 5');
        }
        if (!this.verifyCheckSum(buffer)) {
            throw new Error('checksum_invalid');
        }
        return buffer.slice(0, -4);
    }
    decodeRaw(base58string) {
        return this.codec.decode(base58string);
    }
    verifyCheckSum(bytes) {
        const computed = this.sha256(this.sha256(bytes.slice(0, -4))).slice(0, 4);
        const checksum = bytes.slice(-4);
        return seqEqual(computed, checksum);
    }
}

const codecOptions = {
    sha256: function (bytes) {
        return new Sha256().update(Buffer.from(bytes)).digest();
    },
    alphabet: 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz'
};

export const codec = new Codec(codecOptions);
