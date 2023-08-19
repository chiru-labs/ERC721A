import { SupportedAlgorithms } from './hmac';
import { Arrayish } from '../utils/bytes';
export declare function pbkdf2(password: Arrayish, salt: Arrayish, iterations: number, keylen: number, hashAlgorithm: SupportedAlgorithms): Uint8Array;
