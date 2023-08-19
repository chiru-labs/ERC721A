import { Config } from './config';
export declare const readFileContent: (path: string) => string;
export declare const isFile: (filePath: string) => boolean;
export declare const isDirectory: (directoryPath: string) => boolean;
export declare const getExtensionForCompilerType: (config: Config) => ".vy" | ".sol";
export declare const insert: (source: string, insertedValue: string, index: number) => string;
export declare const removeEmptyDirsRecursively: (directoryPath: string) => void;
