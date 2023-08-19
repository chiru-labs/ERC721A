import type TruffleConfig from "@truffle/config";
import { RequiredSourcesOptions } from "./requiredSources";
export interface ProfilerConfig {
    parseImports?: RequiredSourcesOptions["parseImports"];
    shouldIncludePath?: RequiredSourcesOptions["shouldIncludePath"];
}
export declare class Profiler {
    config: ProfilerConfig;
    constructor(config: ProfilerConfig);
    updated(options: any): Promise<string[]>;
    requiredSources(options: any): Promise<import("./requiredSources").RequiredSources>;
    requiredSourcesForSingleFile(options: TruffleConfig): Promise<import("./requiredSources").RequiredSources>;
}
