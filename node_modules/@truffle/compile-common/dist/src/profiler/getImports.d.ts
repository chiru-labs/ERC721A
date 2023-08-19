export interface ResolvedSource {
    filePath: string;
    body: string;
    source: {
        resolveDependencyPath(importPath: string, dependencyPath: string): string;
    };
}
export interface GetImportsOptions {
    source: ResolvedSource;
    parseImports(body: string): Promise<string[]>;
    shouldIncludePath(filePath: string): boolean;
}
export declare function getImports({ source: { filePath, body, source }, shouldIncludePath, parseImports }: GetImportsOptions): Promise<string[]>;
