import { TOutput, TsGeneratorPlugin } from "./plugins/types";
import { TCfg } from "./parseConfigFile";
import { TDeps } from "./deps";
export declare function tsGenerator(cfg: TCfg, plugins_: TsGeneratorPlugin | TsGeneratorPlugin[], deps_?: TDeps): Promise<void>;
export declare function processOutput(deps: TDeps, cfg: TCfg, output: TOutput): void;
