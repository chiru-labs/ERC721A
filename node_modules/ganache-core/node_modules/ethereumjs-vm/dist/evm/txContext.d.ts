/// <reference types="node" />
export default class TxContext {
    gasPrice: Buffer;
    origin: Buffer;
    constructor(gasPrice: Buffer, origin: Buffer);
}
