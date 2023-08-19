/// <reference types="bn.js" />
/// <reference types="node" />
import { DBOp } from './operation';
import { BN } from 'ethereumjs-util';
import { Block, BlockHeader } from '@ethereumjs/block';
declare function DBSetTD(TD: BN, blockNumber: BN, blockHash: Buffer): DBOp;
declare function DBSetBlockOrHeader(blockBody: Block | BlockHeader): DBOp[];
declare function DBSetHashToNumber(blockHash: Buffer, blockNumber: BN): DBOp;
declare function DBSaveLookups(blockHash: Buffer, blockNumber: BN): DBOp[];
export { DBOp, DBSetTD, DBSetBlockOrHeader, DBSetHashToNumber, DBSaveLookups };
