import { ImportFile } from '@resolver-engine/imports';
import { Config } from './config';
export declare function compileSolcjs(config: Config): (sources: ImportFile[]) => Promise<any>;
export declare function loadCompiler({ compilerVersion, cacheDirectory }: Config): Promise<any>;
