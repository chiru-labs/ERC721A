import type { AstNode, AstNodes } from "../ast/types";
import type * as Compiler from "../compiler";
import type { ContractObject as Artifact } from "@truffle/contract-schema/spec";
import type * as Common from "@truffle/compile-common";
import * as Format from "../format";
import type { Compilation, Contract, VyperSourceMap, ProjectInfo } from "./types";
export declare function shimCompilations(inputCompilations: Common.Compilation[], shimmedCompilationIdPrefix?: string): Compilation[];
export declare function shimCompilation(inputCompilation: Common.Compilation, shimmedCompilationId?: string): Compilation;
/**
 * wrapper around shimContracts that just returns
 * the result in a one-element array (keeping the old name
 * shimArtifacts for compatibility)
 */
export declare function shimArtifacts(artifacts: (Artifact | Common.CompiledContract)[], files?: string[], shimmedCompilationId?: string): Compilation[];
interface CompilationOptions {
    files?: string[];
    sources?: Common.Source[];
    shimmedCompilationId?: string;
    compiler?: Compiler.CompilerVersion;
}
/**
 * shims a bunch of contracts ("artifacts", though not necessarily)
 * to a compilation.  usually used via one of the above functions.
 * Note: if you pass in options.sources, options.files will be ignored.
 * Note: if you pass in options.sources, sources will not have
 * compiler set unless you also pass in options.compiler; in this case
 * you should set that up separately, as in shimCompilation().
 */
export declare function shimContracts(artifacts: (Artifact | Common.CompiledContract)[], options?: CompilationOptions): Compilation;
export declare function getContractNode(contract: Contract, compilation: Compilation): AstNode;
/**
 * convert Vyper source maps to solidity ones
 * (note we won't bother handling the case where the compressed
 * version doesn't exist; that will have to wait for a later version)
 */
export declare function simpleShimSourceMap(sourceMap: string | VyperSourceMap): string;
/**
 * collects user defined types & tagged outputs for a given set of compilations,
 * returning both the definition nodes and (for the types) the type objects
 *
 * "Tagged outputs" means user-defined things that are output by a contract
 * (not input to a contract), and which are distinguished by (potentially
 * ambiguous) selectors.  So, events and custom errors are tagged outputs.
 * Function arguments are not tagged outputs (they're not outputs).
 * Return values are not tagged outputs (they don't have a selector).
 * Built-in errors (Error(string) and Panic(uint))... OK I guess those could
 * be considered tagged outputs, but we're only looking at user-defined ones
 * here.
 */
export declare function collectUserDefinedTypesAndTaggedOutputs(compilations: Compilation[]): {
    definitions: {
        [compilationId: string]: AstNodes;
    };
    typesByCompilation: Format.Types.TypesByCompilationAndId;
    types: Format.Types.TypesById;
};
export declare function infoToCompilations(projectInfo: ProjectInfo | undefined): Compilation[];
export {};
