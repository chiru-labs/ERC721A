/// <reference types="node" />
export declare class Address {
    str: Buffer;
    constructor(str: Buffer);
    protocol(): number;
    payload(): Buffer;
}
