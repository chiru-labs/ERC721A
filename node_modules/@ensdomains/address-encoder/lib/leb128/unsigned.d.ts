/// <reference types="node" />
/**
 * LEB128 encodeds an interger
 * @param {String|Number} num
 * @return {Buffer}
 */
export declare function encode(num: string | number): Buffer;
/**
 * decodes a LEB128 encoded interger
 * @param {Buffer} buffer
 * @return {String}
 */
export declare function decode(buffer: Buffer): any;
