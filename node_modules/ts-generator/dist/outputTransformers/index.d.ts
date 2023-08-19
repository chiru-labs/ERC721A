import { TDeps } from "../deps";
import { TCfg } from "../parseConfigFile";
export declare type TOutputTransformer = (output: string, deps: TDeps, cfg: TCfg) => string;
export declare const outputTransformers: TOutputTransformer[];
