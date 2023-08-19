/// <reference types="bn.js" />
/// <reference types="node" />
import { Address, BN } from 'ethereumjs-util';
import { PrecompileFunc } from './precompiles';
export default class Message {
    to: Address;
    value: BN;
    caller: Address;
    gasLimit: BN;
    data: Buffer;
    depth: number;
    code: Buffer | PrecompileFunc;
    _codeAddress: Address;
    isStatic: boolean;
    isCompiled: boolean;
    salt: Buffer;
    selfdestruct: any;
    delegatecall: boolean;
    constructor(opts: any);
    get codeAddress(): Address;
}
