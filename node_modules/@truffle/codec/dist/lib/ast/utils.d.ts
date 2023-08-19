import type * as Abi from "@truffle/abi-utils";
import * as Common from "../common";
import type { AstNode, AstNodes, Scopes } from "./types";
import BN from "bn.js";
/** @category Definition Reading */
export declare function typeIdentifier(definition: AstNode): string;
/** @category Definition Reading */
export declare function typeString(definition: AstNode): string;
/**
 * Returns the type string, but with location (if any) stripped off the end
 * @category Definition Reading
 */
export declare function typeStringWithoutLocation(definition: AstNode): string;
/**
 * returns basic type class for a variable definition node
 * e.g.:
 *  `t_uint256` becomes `uint`
 *  `t_struct$_Thing_$20_memory_ptr` becomes `struct`
 * @category Definition Reading
 */
export declare function typeClass(definition: AstNode): string;
/**
 * similar to typeClass, but includes any numeric qualifiers
 * e.g.:
 * `t_uint256` becomes `uint256`
 * @category Definition Reading
 */
export declare function typeClassLongForm(definition: AstNode): string;
/**
 * for user-defined types -- structs, enums, contracts
 * often you can get these from referencedDeclaration, but not
 * always
 * @category Definition Reading
 */
export declare function typeId(definition: AstNode): number;
/**
 * For function types; returns internal or external
 * (not for use on other types! will cause an error!)
 * should only return "internal" or "external"
 * @category Definition Reading
 */
export declare function visibility(definition: AstNode): Common.Visibility;
/**
 * e.g. uint48 -> 6
 * @return size in bytes for explicit type size, or `null` if not stated
 * @category Definition Reading
 */
export declare function specifiedSize(definition: AstNode): number;
/**
 * for fixed-point types, obviously
 * @category Definition Reading
 */
export declare function decimalPlaces(definition: AstNode): number;
/** @category Definition Reading */
export declare function isArray(definition: AstNode): boolean;
/** @category Definition Reading */
export declare function isDynamicArray(definition: AstNode): boolean;
/**
 * length of a statically sized array -- please only use for arrays
 * already verified to be static!
 * @category Definition Reading
 */
export declare function staticLength(definition: AstNode): number;
/**
 * see staticLength for explanation
 * @category Definition Reading
 */
export declare function staticLengthAsString(definition: AstNode): string;
/** @category Definition Reading */
export declare function isStruct(definition: AstNode): boolean;
/** @category Definition Reading */
export declare function isMapping(definition: AstNode): boolean;
/** @category Definition Reading */
export declare function isEnum(definition: AstNode): boolean;
/** @category Definition Reading */
export declare function isReference(definition: AstNode): boolean;
/**
 * note: only use this on things already verified to be references
 * @category Definition Reading
 */
export declare function referenceType(definition: AstNode): Common.Location;
/**
 * only for contract types, obviously! will yield nonsense otherwise!
 * @category Definition Reading
 */
export declare function contractKind(definition: AstNode): Common.ContractKind;
/**
 * stack size, in words, of a given type
 * note: this function assumes that UDVTs only ever take up
 * a single word, which is currently true
 * @category Definition Reading
 */
export declare function stackSize(definition: AstNode): number;
/** @category Definition Reading */
export declare function isSimpleConstant(definition: AstNode): boolean;
/**
 * definition: a storage reference definition
 * location: the location you want it to refer to instead
 * @category Definition Reading
 */
export declare function spliceLocation(definition: AstNode, location: Common.Location): AstNode;
/**
 * adds "_ptr" on to the end of type identifiers that might need it; note that
 * this operates on identifiers, not definitions
 * @category Definition Reading
 */
export declare function regularizeTypeIdentifier(identifier: string): string;
/**
 * extract the actual numerical value from a node of type rational.
 * currently assumes result will be integer (currently returns BN)
 * @category Definition Reading
 */
export declare function rationalValue(definition: AstNode): BN;
/** @category Definition Reading */
export declare function baseDefinition(definition: AstNode): AstNode;
/**
 * for use for mappings and arrays only!
 * for arrays, fakes up a uint definition
 * @category Definition Reading
 */
export declare function keyDefinition(definition: AstNode, scopes?: Scopes): AstNode;
/**
 * for use for mappings only!
 * @category Definition Reading
 */
export declare function valueDefinition(definition: AstNode, scopes?: Scopes): AstNode;
/**
 * returns input parameters, then output parameters
 * NOTE: ONLY FOR VARIABLE DECLARATIONS OF FUNCTION TYPE
 * NOT FOR FUNCTION DEFINITIONS
 * @category Definition Reading
 */
export declare function parameters(definition: AstNode): [AstNode[], AstNode[]];
/**
 * compatibility function, since pre-0.5.0 functions don't have node.kind
 * returns undefined if you don't put in a function node
 * @category Definition Reading
 */
export declare function functionKind(node: AstNode): string | undefined;
export declare function functionClass(node: AstNode): string | undefined;
/**
 * similar compatibility function for mutability for pre-0.4.16 versions
 * returns undefined if you don't give it a FunctionDefinition or
 * VariableDeclaration
 * @category Definition Reading
 */
export declare function mutability(node: AstNode): Common.Mutability | undefined;
/**
 * takes a contract definition and asks, does it have a payable fallback
 * function?
 * @category Definition Reading
 */
export declare function isContractPayable(definition: AstNode): boolean;
/**
 * the main function. just does some dispatch.
 * returns undefined on bad input
 */
export declare function definitionToAbi(node: AstNode, referenceDeclarations: AstNodes): Abi.Entry | undefined;
export declare function getterParameters(node: AstNode, referenceDeclarations: AstNodes): {
    inputs: AstNode[];
    outputs: AstNode[];
};
