/**
 * Contains the types for type objects, and some
 * functions for working with them.
 *
 * @category Main Format
 *
 * @packageDocumentation
 */
import type BN from "bn.js";
import type { ContractKind, Location, Mutability } from "../common";
import type { CompilerVersion } from "../compiler";
/**
 * Object representing a type
 *
 * @Category General categories
 */
export declare type Type = UintType | IntType | BoolType | BytesType | AddressType | FixedType | UfixedType | StringType | ArrayType | MappingType | FunctionType | StructType | EnumType | UserDefinedValueTypeType | ContractType | MagicType | TypeType | TupleType;
/**
 * Type of an unsigned integer
 *
 * @Category Elementary types
 */
export interface UintType {
    typeClass: "uint";
    bits: number;
    typeHint?: string;
}
/**
 * Type of a signed integer
 *
 * @Category Elementary types
 */
export interface IntType {
    typeClass: "int";
    bits: number;
    typeHint?: string;
}
/**
 * Type of a boolean
 *
 * @Category Elementary types
 */
export interface BoolType {
    typeClass: "bool";
    typeHint?: string;
}
/**
 * Type of a bytestring (static or dynamic)
 *
 * @Category Elementary types
 */
export declare type BytesType = BytesTypeStatic | BytesTypeDynamic;
/**
 * Type of a static-length bytestring
 *
 * @Category Elementary types
 */
export interface BytesTypeStatic {
    typeClass: "bytes";
    kind: "static";
    length: number;
    typeHint?: string;
}
/**
 * Type of a dynamic-length bytestring
 *
 * @Category Elementary types
 */
export interface BytesTypeDynamic {
    typeClass: "bytes";
    kind: "dynamic";
    location?: Location;
    typeHint?: string;
}
/**
 * Type of an address
 *
 * @Category Elementary types
 */
export declare type AddressType = AddressTypeSpecific | AddressTypeGeneral;
/**
 * Type of an address (with payability specified)
 *
 * @Category Elementary types
 */
export interface AddressTypeSpecific {
    typeClass: "address";
    kind: "specific";
    payable: boolean;
}
/**
 * Type of an address (with payability unspecified)
 *
 * @Category Elementary types
 */
export interface AddressTypeGeneral {
    typeClass: "address";
    kind: "general";
    typeHint?: string;
}
/**
 * Type of a string
 *
 * @Category Elementary types
 */
export interface StringType {
    typeClass: "string";
    location?: Location;
    typeHint?: string;
}
/**
 * Type of a signed fixed-point number
 *
 * @Category Elementary types
 */
export interface FixedType {
    typeClass: "fixed";
    bits: number;
    places: number;
    typeHint?: string;
}
/**
 * Type of an unsigned fixed-point number
 *
 * @Category Elementary types
 */
export interface UfixedType {
    typeClass: "ufixed";
    bits: number;
    places: number;
    typeHint?: string;
}
/**
 * Type of an array
 *
 * @Category Container types
 */
export declare type ArrayType = ArrayTypeStatic | ArrayTypeDynamic;
/**
 * Type of a static-length array
 *
 * @Category Container types
 */
export interface ArrayTypeStatic {
    typeClass: "array";
    kind: "static";
    baseType: Type;
    length: BN;
    location?: Location;
    typeHint?: string;
}
/**
 * Type of a dynamic-length array
 *
 * @Category Container types
 */
export interface ArrayTypeDynamic {
    typeClass: "array";
    kind: "dynamic";
    baseType: Type;
    location?: Location;
    typeHint?: string;
}
/**
 * Type of an elementary value
 *
 * @Category General categories
 */
export declare type ElementaryType = UintType | IntType | BoolType | BytesType | FixedType | UfixedType | AddressType | StringType | EnumType | UserDefinedValueTypeType | ContractType;
/**
 * Types that can underlie a user-defined value type
 *
 * @Category General categories
 */
export declare type BuiltInValueType = UintType | IntType | BoolType | BytesTypeStatic | FixedType | UfixedType | AddressTypeSpecific;
/**
 * Types that can go in the ABI
 *
 * @Category General categories
 */
export declare type AbiType = UintType | IntType | BoolType | BytesType | AddressTypeGeneral | FixedType | UfixedType | StringType | ArrayType | FunctionExternalTypeGeneral | TupleType;
/**
 * Type of a mapping
 *
 * @Category Container types
 */
export interface MappingType {
    typeClass: "mapping";
    keyType: ElementaryType;
    valueType: Type;
    location?: "storage";
}
/**
 * Type of a function pointer (internal or external)
 *
 * @Category Function types
 */
export declare type FunctionType = FunctionInternalType | FunctionExternalType;
/**
 * Type of an internal function pointer
 *
 * @Category Function types
 */
export interface FunctionInternalType {
    typeClass: "function";
    visibility: "internal";
    mutability: Mutability;
    inputParameterTypes: Type[];
    outputParameterTypes: Type[];
}
/**
 * Type of an external function pointer
 *
 * @Category Function types
 */
export declare type FunctionExternalType = FunctionExternalTypeSpecific | FunctionExternalTypeGeneral;
/**
 * Type of an external function pointer (full Solidity type)
 *
 * @Category Function types
 */
export interface FunctionExternalTypeSpecific {
    typeClass: "function";
    visibility: "external";
    kind: "specific";
    mutability: Mutability;
    inputParameterTypes: Type[];
    outputParameterTypes: Type[];
}
/**
 * Type of an external function pointer (general ABI type)
 *
 * @Category Function types
 */
export interface FunctionExternalTypeGeneral {
    typeClass: "function";
    visibility: "external";
    kind: "general";
    typeHint?: string;
}
/**
 * Types defined inside contracts
 *
 * @Category General categories
 */
export declare type ContractDefinedType = StructTypeLocal | EnumTypeLocal | UserDefinedValueTypeTypeLocal;
/**
 * User-defined types
 *
 * @Category General categories
 */
export declare type UserDefinedType = ContractDefinedType | ContractTypeNative | StructTypeGlobal | EnumTypeGlobal | UserDefinedValueTypeTypeGlobal;
/**
 * Type of a struct
 *
 * Structs may be local (defined in a contract) or global (defined outside of any contract)
 *
 * @Category Container types
 */
export declare type StructType = StructTypeLocal | StructTypeGlobal;
export interface NameTypePair {
    name: string;
    type: Type;
}
/**
 * Local structs (defined in contracts)
 *
 * @Category Container types
 */
export interface StructTypeLocal {
    typeClass: "struct";
    kind: "local";
    /**
     * Internal ID.  Format may change in future.
     */
    id: string;
    typeName: string;
    definingContractName: string;
    definingContract?: ContractTypeNative;
    /**
     * these must be in order
     */
    memberTypes?: NameTypePair[];
    location?: Location;
}
/**
 * Global structs
 *
 * @Category Container types
 */
export interface StructTypeGlobal {
    typeClass: "struct";
    kind: "global";
    /**
     * Internal ID.  Format may change in future.
     */
    id: string;
    typeName: string;
    /**
     * these must be in order
     */
    memberTypes?: NameTypePair[];
    location?: Location;
}
export interface OptionallyNamedType {
    name?: string;
    type: Type;
}
/**
 * Type of a tuple (for use in ABI)
 *
 * @Category Container types
 */
export interface TupleType {
    typeClass: "tuple";
    memberTypes: OptionallyNamedType[];
    typeHint?: string;
}
/**
 * Type of an enum
 *
 * Enums may be local (defined in a contract) or global (defined outside of any contract)
 *
 * @Category User-defined elementary types
 */
export declare type EnumType = EnumTypeLocal | EnumTypeGlobal;
/**
 * Local enum (defined in a contract)
 *
 * @Category User-defined elementary types
 */
export interface EnumTypeLocal {
    typeClass: "enum";
    kind: "local";
    /**
     * Internal ID.  Format may change in future.
     */
    id: string;
    typeName: string;
    definingContractName: string;
    definingContract?: ContractTypeNative;
    /**
     * these must be in order
     */
    options?: string[];
}
/**
 * Global enum
 *
 * @Category User-defined elementary types
 */
export interface EnumTypeGlobal {
    typeClass: "enum";
    kind: "global";
    /**
     * Internal ID.  Format may change in future.
     */
    id: string;
    typeName: string;
    /**
     * these must be in order
     */
    options?: string[];
}
/**
 * Type of a contract; used not just for actual values but wherever a contract type
 * is needed
 *
 * Contract types may be native (has Solidity info) or foreign (lacking Solidity info).
 *
 * @Category User-defined elementary types
 */
export declare type ContractType = ContractTypeNative | ContractTypeForeign;
/**
 * Type of a contract with full Solidity info -- may be used for actual variables
 *
 * @Category User-defined elemntary types
 */
export interface ContractTypeNative {
    typeClass: "contract";
    kind: "native";
    /**
     * Internal ID.  Format may change in future.
     */
    id: string;
    typeName: string;
    contractKind?: ContractKind;
    /**
     * Indicates whether contract has payable fallback function
     */
    payable?: boolean;
}
/**
 * Type of a contract w/o full Solidity info -- not used for actual variables
 *
 * @Category User-defined elementary types
 */
export interface ContractTypeForeign {
    typeClass: "contract";
    kind: "foreign";
    typeName: string;
    contractKind?: ContractKind;
    /**
     * Indicates whether contract has payable fallback function
     */
    payable?: boolean;
}
/**
 * Type of a user-defined value type
 *
 * These may be local (defined in a contract) or global (defined outside of any contract)
 *
 * @Category User-defined elementary types
 */
export declare type UserDefinedValueTypeType = UserDefinedValueTypeTypeLocal | UserDefinedValueTypeTypeGlobal;
/**
 * Local UDVT (defined in a contract)
 *
 * @Category User-defined elementary types
 */
export interface UserDefinedValueTypeTypeLocal {
    typeClass: "userDefinedValueType";
    kind: "local";
    /**
     * Internal ID.  Format may change in future.
     */
    id: string;
    typeName: string;
    definingContractName: string;
    definingContract?: ContractTypeNative;
    underlyingType?: BuiltInValueType;
}
/**
 * Global UDVT (defined outside a contract)
 *
 * @Category User-defined elementary types
 */
export interface UserDefinedValueTypeTypeGlobal {
    typeClass: "userDefinedValueType";
    kind: "global";
    /**
     * Internal ID.  Format may change in future.
     */
    id: string;
    typeName: string;
    underlyingType?: BuiltInValueType;
}
export declare type MagicVariableName = "message" | "block" | "transaction";
/**
 * Type of a magic variable
 *
 * @Category Special container types (debugger-only)
 */
export interface MagicType {
    typeClass: "magic";
    variable: MagicVariableName;
    memberTypes?: {
        [field: string]: Type;
    };
}
/**
 * Type of a type!  This is currently only used for contract types and enum
 * types, but may expand in the future.
 * @Category Special container types (debugger-only)
 */
export declare type TypeType = TypeTypeContract | TypeTypeEnum;
/**
 * Type of a contract type
 * @Category Special container types (debugger-only)
 */
export interface TypeTypeContract {
    typeClass: "type";
    type: ContractTypeNative;
    /**
     * these must be in order, and must only include
     * **non-inherited** state variables
     */
    stateVariableTypes?: NameTypePair[];
}
/**
 * Type of an enum type
 * @Category Special container types (debugger-only)
 */
export interface TypeTypeEnum {
    typeClass: "type";
    type: EnumType;
}
/**
 * Reference types
 *
 * @Category General categories
 */
export declare type ReferenceType = ArrayType | MappingType | StructType | StringType | BytesTypeDynamic;
export interface TypesById {
    [id: string]: UserDefinedType;
}
export interface TypesByCompilationAndId {
    [compilationId: string]: {
        compiler: CompilerVersion;
        types: TypesById;
    };
}
export declare function forgetCompilations(typesByCompilation: TypesByCompilationAndId): TypesById;
export declare function isReferenceType(anyType: Type): anyType is ReferenceType;
export declare function fullType(basicType: Type, userDefinedTypes: TypesById): Type;
export declare function specifyLocation(dataType: Type, location: Location | undefined): Type;
export declare function typeString(dataType: Type): string;
export declare function typeStringWithoutLocation(dataType: Type): string;
export declare function isContractDefinedType(anyType: Type): anyType is ContractDefinedType;
