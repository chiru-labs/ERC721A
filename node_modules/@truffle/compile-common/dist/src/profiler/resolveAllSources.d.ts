import { ResolvedSource } from "./getImports";
export interface ResolveAllSourcesOptions {
    paths: string[];
    resolve(source: UnresolvedSource): Promise<ResolvedSource | undefined>;
    parseImports(body: string): Promise<string[]>;
    shouldIncludePath(filePath: string): boolean;
}
export interface ResolvedSourceWithImports extends ResolvedSource {
    imports: string[];
}
export interface ResolvedSourcesMapping {
    [filePath: string]: ResolvedSourceWithImports;
}
export interface UnresolvedSource {
    filePath: string;
    importedFrom?: string;
}
export declare function resolveAllSources({ resolve, paths, shouldIncludePath, parseImports }: ResolveAllSourcesOptions): Promise<ResolvedSourcesMapping>;
