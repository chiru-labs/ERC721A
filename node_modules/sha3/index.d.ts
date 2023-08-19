declare class Hasher<S = number> {
    constructor(size?: S);

    update(data: Buffer): this;
    update(data: string, encoding?: BufferEncoding): this;

    digest(): Buffer;
    digest(encoding: "binary"): Buffer;
    digest(encoding: BufferEncoding): string;
    digest(options: DigestOptions<"binary">): Buffer;
    digest(options: DigestOptions<BufferEncoding>): string;

    reset(): this;
}

declare interface DigestOptions<T> {
    format: T;
    buffer?: Buffer;
    padding?: number;
}

/**
 * The SHA-3 specification requires that the input message be appended with a
 * two-bit suffix, `01`. For byte-aligned messages, this results in an extra
 * `0x02` byte (bits fill in from the right).
 *
 * Then, the standard Keccak padding scheme is applied (pad10*1), placing an
 * additional bit at the `0x04` position, resulting in `0x06`.
 *
 * https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf, Section B.2
 */
export class SHA3<S extends 224 | 256 | 384 | 512 = 512> extends Hasher<S> {
    /**
     * For backwards-compatibility, sprinkle SHA3Hash into the default export.
     *
     * @deprecated
     */
    static SHA3Hash: typeof Keccak;
}

/**
 * Provided for historical purposes. This is an alias for the *Keccak* algorithm,
 * which an early version of SHA3 with different padding.
 *
 * @deprecated
 */
export const SHA3Hash: typeof Keccak;

/**
 * The Keccak reference implementation uses the simplest possible padding scheme,
 * described as follows:
 *
 * > Definition 1. Multi-rate padding, denoted by pad10*1, appends a single bit 1
 * > followed by the minimum number of bits 0 followed by a single bit 1 such that
 * > the length of the result is a multiple of the block length.
 *
 * https://keccak.team/files/Keccak-reference-3.0.pdf, Section 1.1.2
 */
export class Keccak<S extends 224 | 256 | 384 | 512 = 512> extends Hasher<S> {}

export class SHAKE<S extends 128 | 256 = 256> extends Hasher<S> {}

export default SHA3;
