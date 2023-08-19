import type * as Compilations from "../compilations";
import type * as Ast from "../ast";
import type { Context, Contexts } from "./types";
export declare function findContext(contexts: Contexts, binary: string): Context | null;
export declare function matchContext(context: Context, givenBinary: string): boolean;
export declare function normalizeContexts(contexts: Contexts): Contexts;
export declare function makeContext(contract: Compilations.Contract, node: Ast.AstNode | undefined, compilation: Compilations.Compilation, isConstructor?: boolean): Context;
