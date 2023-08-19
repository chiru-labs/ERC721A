import { InputConfig } from './config';
export declare function compileProject(configPath?: string): Promise<void>;
export declare function compileAndSave(input: InputConfig): Promise<void>;
export declare function compile(input: InputConfig): Promise<any>;
