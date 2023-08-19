/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from 'ethereumjs-util';
import { CacheMap } from './manager';
export declare enum DBTarget {
    Heads = 0,
    HeadHeader = 1,
    HeadBlock = 2,
    HashToNumber = 3,
    NumberToHash = 4,
    TotalDifficulty = 5,
    Body = 6,
    Header = 7,
    CliqueSignerStates = 8,
    CliqueVotes = 9,
    CliqueBlockSigners = 10
}
/**
 * DBOpData is a type which has the purpose of holding the actual data of the Database Operation.
 * @hidden
 */
export interface DBOpData {
    type?: String;
    key: Buffer | string;
    keyEncoding: String;
    valueEncoding?: String;
    value?: Buffer | object;
}
export declare type DatabaseKey = {
    blockNumber?: BN;
    blockHash?: Buffer;
};
/**
 * The DBOp class aids creating database operations which is used by `level` using a more high-level interface
 */
export declare class DBOp {
    operationTarget: DBTarget;
    baseDBOp: DBOpData;
    cacheString: string | undefined;
    private constructor();
    static get(operationTarget: DBTarget, key?: DatabaseKey): DBOp;
    static set(operationTarget: DBTarget, value: Buffer | object, key?: DatabaseKey): DBOp;
    static del(operationTarget: DBTarget, key?: DatabaseKey): DBOp;
    updateCache(cacheMap: CacheMap): void;
}
