/**
 * @Category Enumerations
 */
export declare type Location = "storage" | "memory" | "calldata";
/**
 * @Category Enumerations
 */
export declare type Visibility = "internal" | "external";
/**
 * @Category Enumerations
 */
export declare type Mutability = "pure" | "view" | "nonpayable" | "payable";
/**
 * @Category Enumerations
 */
export declare type ContractKind = "contract" | "library" | "interface";
/**
 * @Category Enumerations
 */
export declare type PaddingMode = "default" | "permissive" | "zero" | "right" | "defaultOrZero";
/**
 * @Category Enumerations
 */
export declare type PaddingType = "left" | "right" | "signed" | "signedOrLeft";
/**
 * This error indicates that the decoder was unable to locate a user-defined
 * type (struct, enum, or contract type) via its ID.  Unfortunately, we can't
 * always avoid this at the moment; we're hoping to make this more robust in
 * the future with Truffle DB.  In the meantime, it is at least worth noting that
 * you should not encounter this error if your entire project was written in
 * Solidity and all compiled at once.  Sorry.
 *
 * @Category Errors
 */
export declare class UnknownUserDefinedTypeError extends Error {
    typeString: string;
    id: string;
    constructor(id: string, typeString: string);
}
