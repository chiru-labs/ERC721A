import { ImportFile } from '@resolver-engine/imports';
export declare function findImports(sources: ImportFile[]): (file: string) => {
    contents: string;
    error?: undefined;
} | {
    error: string;
    contents?: undefined;
};
