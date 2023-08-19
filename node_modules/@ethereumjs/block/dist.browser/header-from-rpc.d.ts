import { BlockHeader } from './header';
import { BlockOptions } from './types';
/**
 * Creates a new block header object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param chainOptions - An object describing the blockchain
 */
export default function blockHeaderFromRpc(blockParams: any, options?: BlockOptions): BlockHeader;
