export interface UpdatedOptions {
    paths: string[];
    contractsBuildDirectory: string;
}
export declare function updated({ paths, contractsBuildDirectory, }: UpdatedOptions): Promise<string[]>;
