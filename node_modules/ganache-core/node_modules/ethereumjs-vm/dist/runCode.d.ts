/// <reference types="node" />
import VM from './index';
import TxContext from './evm/txContext';
import Message from './evm/message';
import { default as EVM, ExecResult } from './evm/evm';
/**
 * Options for the [[runCode]] method.
 */
export interface RunCodeOpts {
    /**
     * The [`Block`](https://github.com/ethereumjs/ethereumjs-block) the `tx` belongs to. If omitted a blank block will be used
     */
    block?: any;
    evm?: EVM;
    txContext?: TxContext;
    gasPrice?: Buffer;
    /**
     * The address where the call originated from. The address should be a `Buffer` of 20 bits. Defaults to `0`
     */
    origin?: Buffer;
    message?: Message;
    /**
     * The address that ran this code. The address should be a `Buffer` of 20 bits. Defaults to `0`
     */
    caller?: Buffer;
    /**
     * The EVM code to run
     */
    code?: Buffer;
    /**
     * The input data
     */
    data?: Buffer;
    /**
     * Gas limit
     */
    gasLimit?: Buffer;
    /**
     * The value in ether that is being sent to `opt.address`. Defaults to `0`
     */
    value?: Buffer;
    depth?: number;
    isStatic?: boolean;
    selfdestruct?: {
        [k: string]: boolean;
    };
    /**
     * The address of the account that is executing this code. The address should be a `Buffer` of bytes. Defaults to `0`
     */
    address?: Buffer;
    /**
     * The initial program counter. Defaults to `0`
     */
    pc?: number;
}
/**
 * @ignore
 */
export default function runCode(this: VM, opts: RunCodeOpts): Promise<ExecResult>;
