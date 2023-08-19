export interface IOptions {
    files: string;
    target: string;
    outDir?: string;
}
export declare function parseArgs(): IOptions;
