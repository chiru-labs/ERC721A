/// <reference types="node" />
import VM from './index';
import { EVMResult } from './evm/evm';
/**
 * Options for running a call (or create) operation
 */
export interface RunCallOpts {
    block?: any;
    gasPrice?: Buffer;
    origin?: Buffer;
    caller?: Buffer;
    gasLimit?: Buffer;
    to?: Buffer;
    value?: Buffer;
    data?: Buffer;
    /**
     * This is for CALLCODE where the code to load is different than the code from the to account
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
