import { Options as PrettierOptions } from "prettier";
import { TDeps } from "./deps";
import { Dictionary, Omit } from "ts-essentials";
import { TLoggerLvl } from "./logger";
export declare type TRawPluginCfg<T = Dictionary<any>> = {
    files: string;
    generator: string;
} & T;
export declare type TPluginCfg<T = Dictionary<any>> = Omit<TRawPluginCfg<T>, "generator">;
export interface TRawCfg {
    cwd: string;
    plugins: TRawPluginCfg[];
    prettier?: PrettierOptions;
    loggingLvl?: TLoggerLvl;
}
export declare type TCfg = Omit<TRawCfg, "plugins">;
interface TArgs {
    cwd: string;
    configPath: string;
}
export declare function parseConfigFile({ fs, prettier, logger }: TDeps, { cwd, configPath }: TArgs): Promise<TRawCfg>;
export {};
