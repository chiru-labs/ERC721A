/**
 * @protected
 *
 * @packageDocumentation
 */
import type * as Format from "../../format/common";
import type * as Common from "../../common";
import * as Compiler from "../../compiler";
import type { AstNode, AstNodes } from "../types";
export declare function definitionToType(definition: AstNode, compilationId: string, compiler: Compiler.CompilerVersion, forceLocation?: Common.Location | null): Format.Types.Type;
export declare function definitionToStoredType(definition: AstNode, compilationId: string, compiler: Compiler.CompilerVersion, referenceDeclarations?: AstNodes): Format.Types.UserDefinedType;
