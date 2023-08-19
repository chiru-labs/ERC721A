import { ResolveAllSourcesOptions } from "./resolveAllSources";
export interface RequiredSourcesOptions {
    allPaths: string[];
    updatedPaths: string[];
    resolve: ResolveAllSourcesOptions["resolve"];
    parseImports: ResolveAllSourcesOptions["parseImports"];
    shouldIncludePath: ResolveAllSourcesOptions["shouldIncludePath"];
}
export interface RequiredSources {
    allSources: {
        [filePath: string]: string;
    };
    compilationTargets: string[];
}
export declare function requiredSources({ allPaths, updatedPaths, resolve, shouldIncludePath, parseImports }: RequiredSourcesOptions): Promise<RequiredSources>;
