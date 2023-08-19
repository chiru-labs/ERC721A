import { SHA3 } from 'sha3';
import { RIPEMD160 } from 'ripemd160-min';

export function sha256(data, resultEncoding) {
  return new SHA3(256).update(data).digest(resultEncoding);
}

export function ripemd160(data) {
  return Buffer.from(new RIPEMD160().update(data).digest());
}
