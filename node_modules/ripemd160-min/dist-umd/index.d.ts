export declare type ByteArray = number[] | Uint8Array;
export declare class RIPEMD160 {
    private _block;
    private _blockSize;
    private _blockOffset;
    private _length;
    private _finalized;
    private _a;
    private _b;
    private _c;
    private _d;
    private _e;
    constructor();
    update(data: ByteArray): this;
    private _update;
    digest(): ByteArray;
}
export default RIPEMD160;
//# sourceMappingURL=index.d.ts.map