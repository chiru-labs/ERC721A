/*!
NEM-sdk - NEM Developer Kit for Node.js and the browser

MIT License

Copyright (c) 2017 QuantumMachine

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

import { Keccak } from 'sha3';

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export const hex2a = (hexx) => {
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }return str;
};

var _hexEncodeArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

export const ua2hex = (ua) => {
    var s = '';
    for (var i = 0; i < ua.length; i++) {
        var code = ua[i];
        s += _hexEncodeArray[code >>> 4];
        s += _hexEncodeArray[code & 0x0F];
    }
    return s;
};

export const b32decode = function b32decode(s) {
    var r = new ArrayBuffer(s.length * 5 / 8);
    var b = new Uint8Array(r);
    for (var j = 0; j < s.length / 8; j++) {
        var v = [0, 0, 0, 0, 0, 0, 0, 0];
        for (var _i4 = 0; _i4 < 8; ++_i4) {
            v[_i4] = alphabet.indexOf(s[j * 8 + _i4]);
        }
        var i = 0;
        b[j * 5 + 0] = v[i + 0] << 3 | v[i + 1] >> 2;
        b[j * 5 + 1] = (v[i + 1] & 0x3) << 6 | v[i + 2] << 1 | v[i + 3] >> 4;
        b[j * 5 + 2] = (v[i + 3] & 0xf) << 4 | v[i + 4] >> 1;
        b[j * 5 + 3] = (v[i + 4] & 0x1) << 7 | v[i + 5] << 2 | v[i + 6] >> 3;
        b[j * 5 + 4] = (v[i + 6] & 0x7) << 5 | v[i + 7];
    }
    return Buffer.from(b);
};

export const b32encode = function b32encode(s) {
    var parts = [];
    var quanta = Math.floor(s.length / 5);
    var leftover = s.length % 5;

    if (leftover != 0) {
        for (var i = 0; i < 5 - leftover; i++) {
            s += '\x00';
        }
        quanta += 1;
    }

    for (var _i = 0; _i < quanta; _i++) {
        parts.push(alphabet.charAt(s.charCodeAt(_i * 5) >> 3));
        parts.push(alphabet.charAt((s.charCodeAt(_i * 5) & 0x07) << 2 | s.charCodeAt(_i * 5 + 1) >> 6));
        parts.push(alphabet.charAt((s.charCodeAt(_i * 5 + 1) & 0x3F) >> 1));
        parts.push(alphabet.charAt((s.charCodeAt(_i * 5 + 1) & 0x01) << 4 | s.charCodeAt(_i * 5 + 2) >> 4));
        parts.push(alphabet.charAt((s.charCodeAt(_i * 5 + 2) & 0x0F) << 1 | s.charCodeAt(_i * 5 + 3) >> 7));
        parts.push(alphabet.charAt((s.charCodeAt(_i * 5 + 3) & 0x7F) >> 2));
        parts.push(alphabet.charAt((s.charCodeAt(_i * 5 + 3) & 0x03) << 3 | s.charCodeAt(_i * 5 + 4) >> 5));
        parts.push(alphabet.charAt(s.charCodeAt(_i * 5 + 4) & 0x1F));
    }

    var replace = 0;
    if (leftover == 1) replace = 6;else if (leftover == 2) replace = 4;else if (leftover == 3) replace = 3;else if (leftover == 4) replace = 1;

    for (var _i2 = 0; _i2 < replace; _i2++) {
        parts.pop();
    }for (var _i3 = 0; _i3 < replace; _i3++) {
        parts.push("=");
    }return parts.join("");
};

export const isValid = addr => {
    let address = addr.toString().toUpperCase().replace(/-/g, '');
    if (!address || address.length !== 40) {
        return false;
    }

    let decoded = toHex(b32decode(address));

    let stepThreeChecksum = KeccakChecksum(Buffer.from(decoded.slice(0, 42), 'hex'));

    return stepThreeChecksum === decoded.slice(42);
};

const toHex = arrayOfBytes => {
    let finalHex = '';
    for (let i = 0; i < arrayOfBytes.length; i++) {
        let hex = Math.round(arrayOfBytes[i]).toString(16);
        if (hex.length === 1) {
            hex = '0' + hex
        }
        finalHex += hex
    }
    return finalHex;
};

const KeccakChecksum = (payload) => {
    return new Keccak(256).update(payload).digest('hex').toString().substr(0, 8)
};
