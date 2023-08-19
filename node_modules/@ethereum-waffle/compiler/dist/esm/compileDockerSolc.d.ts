import { Config } from './config';
import { ImportFile } from '@resolver-engine/imports';
export declare function compileDockerSolc(config: Config): (sources: ImportFile[]) => Promise<any>;
export declare function createBuildCommand(config: Config): string;
export declare function getVolumes(config: Config): string;
