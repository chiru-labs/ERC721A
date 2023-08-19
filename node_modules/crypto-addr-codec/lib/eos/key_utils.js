import base58 from 'bs58';
import { assert, assertBuffer } from './helper';
import { sha256, ripemd160 } from './hash';

export function checkEncode(keyBuffer) {
  const keyType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  assertBuffer(keyBuffer, 'expecting keyBuffer<Buffer>');

  if (keyType === 'sha256x2') {
    // legacy
    const checksum = sha256(sha256(keyBuffer)).slice(0, 4);
    return base58.encode(Buffer.concat([keyBuffer, checksum]));
  } else {
    const check = [keyBuffer];

    if (keyType) {
      check.push(Buffer.from(keyType));
    }

    const _checksum = ripemd160(Buffer.concat(check)).slice(0, 4);

    return base58.encode(Buffer.concat([keyBuffer, _checksum]));
  }
}

export function checkDecode(keyString) {
  const keyType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  assert(keyString, 'private key expected');
  const buffer = new Buffer(base58.decode(keyString));
  const checksum = buffer.slice(-4);
  const key = buffer.slice(0, -4);
  let newCheck;

  if (keyType === 'sha256x2') {
    // legacy
    newCheck = sha256(sha256(key)).slice(0, 4); // WIF (legacy)
  } else {
    const check = [key];

    if (keyType) {
      check.push(Buffer.from(keyType));
    }

    newCheck = ripemd160(Buffer.concat(check)).slice(0, 4); //PVT
  }

  if (checksum.toString('hex') !== newCheck.toString('hex')) {
    throw new Error('Invalid checksum, ' + "".concat(checksum.toString('hex'), " != ").concat(newCheck.toString('hex')));
  }

  return key;
}
