/// <reference types="node" />
import BN = require('bn.js');
import { PrecompileFunc } from './precompiles';
export default class Message {
    to: Buffer;
    value: BN;
    caller: Buffer;
    gasLimit: BN;
    data: Buffer;
    depth: number;
    code: Buffer | PrecompileFunc;
    _codeAddress: Buffer;
    isStatic: boolean;
    isCompiled: boolean;
    salt: Buffer;
    selfdestruct: any;
    delegatecall: boolean;
    constructor(opts: any);
    get codeAddress(): Buffer;
}
