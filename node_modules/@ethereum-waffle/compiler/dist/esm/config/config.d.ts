export interface Config {
    /** Location of the project sources e.g. ./contracts */
    sourceDirectory: string;
    /** Location of compilation artifacts e.g. ./dist */
    outputDirectory: string;
    /** Location of flattening artifacts e.g. ./dist */
    flattenOutputDirectory: string;
    /** Location of the dependencies e.g. ./node_modules */
    nodeModulesDirectory: string;
    /** Location of saved caches e.g. ./cache */
    cacheDirectory: string;
    /**
     * Compiler type:
     * - native - uses local installation of solc
     * - dockerized-solc - uses solc from a docker image
     * - solcjs - uses solc from the solcjs npm package
     * - dockerized-vyper - uses vyper from a docker image
     */
    compilerType: 'native' | 'dockerized-solc' | 'solcjs' | 'dockerized-vyper';
    /** Version of the solidity compiler e.g. "0.5.1" or "default" */
    compilerVersion: string;
    /**
     * Additional allowed paths for the compiler.
     * Only used for native compiler type.
     */
    compilerAllowedPaths: string[];
    /** Options passed to the compiler */
    compilerOptions: any;
    /** Include the humanReadableAbi format */
    outputHumanReadableAbi: boolean;
    /**
     * What files should be outputted
     * - multiple - single file for each contract
     * - combined - single file for all contracts
     * - all - both of the above
     * - minimal - output just ABI and Bytecode
     */
    outputType: 'multiple' | 'combined' | 'all' | 'minimal';
    /** Control contract types generation with Typechain */
    /** Enable type generation. False by default */
    typechainEnabled: boolean;
    /** Target directory for generated types. Relative to outputDirectory */
    typechainOutputDir: string;
}
export declare type InputConfig = Partial<Config>;
