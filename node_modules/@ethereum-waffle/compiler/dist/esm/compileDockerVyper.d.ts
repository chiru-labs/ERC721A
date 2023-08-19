import { Config } from './config';
import { ImportFile } from '@resolver-engine/imports';
export declare function compileDockerVyper(config: Config): (sources: ImportFile[]) => Promise<any>;
export declare function createBuildCommand(config: Config): string;
