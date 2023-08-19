/// <reference types="node" />
import Common from '@ethereumjs/common';
import { Address } from 'ethereumjs-util';
import { RunState } from './../interpreter';
/**
 * Adds address to accessedAddresses set if not already included.
 * Adjusts cost incurred for executing opcode based on whether address read
 * is warm/cold. (EIP 2929)
 * @param {RunState} runState
 * @param {BN}       address
 * @param {Common}   common
 * @param {Boolean}  chargeGas (default: true)
 * @param {Boolean}  isSelfdestruct (default: false)
 */
export declare function accessAddressEIP2929(runState: RunState, address: Address, common: Common, chargeGas?: boolean, isSelfdestruct?: boolean): void;
/**
 * Adds (address, key) to accessedStorage tuple set if not already included.
 * Adjusts cost incurred for executing opcode based on whether storage read
 * is warm/cold. (EIP 2929)
 * @param {RunState} runState
 * @param {Buffer} key (to storage slot)
 * @param {Common} common
 */
export declare function accessStorageEIP2929(runState: RunState, key: Buffer, isSstore: boolean, common: Common): void;
/**
 * Adjusts cost of SSTORE_RESET_GAS or SLOAD (aka sstorenoop) (EIP-2200) downward when storage
 * location is already warm
 * @param  {RunState} runState
 * @param  {Buffer}   key          storage slot
 * @param  {number}   defaultCost  SSTORE_RESET_GAS / SLOAD
 * @param  {string}   costName     parameter name ('reset' or 'noop')
 * @param  {Common}   common
 * @return {number}                adjusted cost
 */
export declare function adjustSstoreGasEIP2929(runState: RunState, key: Buffer, defaultCost: number, costName: string, common: Common): number;
