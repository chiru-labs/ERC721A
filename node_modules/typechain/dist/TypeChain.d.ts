import { TsGeneratorPlugin, TFileDesc, TContext, TOutput } from 'ts-generator';
export interface ITypeChainCfg {
    target: string;
    outDir?: string;
}
/**
 * Proxies calls to real implementation that is selected based on target parameter.
 */
export declare class TypeChain extends TsGeneratorPlugin {
    name: string;
    private realImpl;
    constructor(ctx: TContext<ITypeChainCfg>);
    private findRealImpl;
    beforeRun(): TOutput | Promise<TOutput>;
    transformFile(file: TFileDesc): TOutput | Promise<TOutput>;
    afterRun(): TOutput | Promise<TOutput>;
}
