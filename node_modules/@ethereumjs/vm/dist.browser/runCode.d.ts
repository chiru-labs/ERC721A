/// <reference types="bn.js" />
/// <reference types="node" />
import { Address, BN } from 'ethereumjs-util';
import { Block } from '@ethereumjs/block';
import VM from './index';
import TxContext from './evm/txContext';
import Message from './evm/message';
import { default as EVM, ExecResult } from './evm/evm';
/**
 * Options for the {@link runCode} method.
 */
export interface RunCodeOpts {
    /**
     * The `@ethereumjs/block` the `tx` belongs to. If omitted a default blank block will be used.
     */
    block?: Block;
    evm?: EVM;
    txContext?: TxContext;
    gasPrice?: BN;
    /**
     * The address where the call originated from. Defaults to the zero address.
     */
    origin?: Address;
    message?: Message;
    /**
     * The address that ran this code (`msg.sender`). Defaults to the zero address.
     */
    caller?: Address;
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
    gasLimit?: BN;
    /**
     * The value in ether that is being sent to `opt.address`. Defaults to `0`
     */
    value?: BN;
    depth?: number;
    isStatic?: boolean;
    selfdestruct?: {
        [k: string]: boolean;
    };
    /**
     * The address of the account that is executing this code (`address(this)`). Defaults to the zero address.
     */
    address?: Address;
    /**
     * The initial program counter. Defaults to `0`
     */
    pc?: number;
}
/**
 * @ignore
 */
export default function runCode(this: VM, opts: RunCodeOpts): Promise<ExecResult>;
