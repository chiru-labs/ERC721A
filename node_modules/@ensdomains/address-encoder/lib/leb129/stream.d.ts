/// <reference types="node" />
export declare class FakeStream {
    buffer: Buffer;
    private _bytesRead;
    constructor(buf?: Buffer);
    read(size: number): Buffer;
    write(buf: Buffer): void;
}
