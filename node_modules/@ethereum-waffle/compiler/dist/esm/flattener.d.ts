import mkdirp from 'mkdirp';
import { InputConfig } from './config';
export interface GatheredContractInterface {
    url: string;
    source: string;
    provider: string;
}
export declare function flattenProject(configPath?: string): Promise<void>;
export declare function flattenAndSave(input: InputConfig): Promise<void>;
export declare function flattenSingleFile(input: InputConfig, name: string): Promise<mkdirp.Made>;
export declare function normalizeSpdxLicenceIdentifiers(flattenContracts: string, contractName: string): string;
