import { TPluginCfg } from "../parseConfigFile";
import { Dictionary } from "ts-essentials";
import { TLogger } from "../logger";
export declare type TOutput = void | TFileDesc | TFileDesc[];
export declare abstract class TsGeneratorPlugin {
    readonly ctx: TContext;
    abstract readonly name: string;
    readonly logger: TLogger;
    constructor(ctx: TContext);
    beforeRun(): TOutput | Promise<TOutput>;
    afterRun(): TOutput | Promise<TOutput>;
    abstract transformFile(file: TFileDesc): TOutput | Promise<TOutput>;
}
export interface TContext<T = Dictionary<any>> {
    cwd: string;
    rawConfig: TPluginCfg<T>;
    logger?: TLogger;
}
export interface TFileDesc {
    path: string;
    contents: string;
}
