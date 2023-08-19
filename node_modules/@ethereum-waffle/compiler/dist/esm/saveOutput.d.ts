/// <reference types="node" />
import fs from 'fs';
import { Config } from './config';
import mkdirp from 'mkdirp';
export interface BytecodeJson {
    linkReferences: any;
    object: string;
    opcodes: string;
    sourceMap: string;
}
export interface EvmJson {
    bytecode: BytecodeJson;
    deployedBytecode?: BytecodeJson;
}
export interface ContractJson {
    'srcmap-runtime'?: string;
    srcmap?: string;
    bin?: string;
    'bin-runtime'?: string;
    abi: any[];
    bytecode?: string;
    humanReadableAbi?: string[];
    evm: EvmJson;
}
export declare function saveOutput(output: any, config: Config, filesystem?: {
    createDirectory: typeof mkdirp.sync;
    writeFile: typeof fs.writeFileSync;
}): Promise<void>;
