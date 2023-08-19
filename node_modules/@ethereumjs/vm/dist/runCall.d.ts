/// <reference types="bn.js" />
/// <reference types="node" />
import { Address, BN } from 'ethereumjs-util';
import { Block } from '@ethereumjs/block';
import VM from './index';
import { EVMResult } from './evm/evm';
/**
 * Options for running a call (or create) operation
 */
export interface RunCallOpts {
    block?: Block;
    gasPrice?: BN;
    origin?: Address;
    caller?: Address;
    gasLimit?: BN;
    to?: Address;
    value?: BN;
    data?: Buffer;
    /**
     * This is for CALLCODE where the code to load is different than the code from the `opts.to` address.
     */
    code?: Buffer;
    depth?: number;
    compiled?: boolean;
    static?: boolean;
    salt?: Buffer;
    selfdestruct?: {
        [k: string]: boolean;
    };
    delegatecall?: boolean;
}
/**
 * @ignore
 */
export default function runCall(this: VM, opts: RunCallOpts): Promise<EVMResult>;
