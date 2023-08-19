/// <reference types="bn.js" />
/// <reference types="node" />
import { Address, BN } from 'ethereumjs-util';
export declare type CliqueSignerState = [BN, Address[]];
export declare type CliqueLatestSignerStates = CliqueSignerState[];
export declare type CliqueVote = [BN, [Address, Address, Buffer]];
export declare type CliqueLatestVotes = CliqueVote[];
export declare type CliqueBlockSigner = [BN, Address];
export declare type CliqueLatestBlockSigners = CliqueBlockSigner[];
export declare const CLIQUE_NONCE_AUTH: Buffer;
export declare const CLIQUE_NONCE_DROP: Buffer;
