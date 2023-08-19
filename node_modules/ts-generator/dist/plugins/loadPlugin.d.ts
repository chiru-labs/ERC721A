import { TDeps } from "../deps";
import { TContext, TsGeneratorPlugin } from "./types";
import { Dictionary } from "ts-essentials";
export declare function loadPlugin(deps: TDeps, ctx: TContext): TsGeneratorPlugin;
export declare function getFirstKey<T>(object: Dictionary<T>): T;
