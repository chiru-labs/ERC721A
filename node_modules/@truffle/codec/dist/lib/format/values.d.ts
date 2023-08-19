/**
 * Contains the types for value and result objects.
 * @category Main Format
 *
 * @packageDocumentation
 */
import type * as Types from "./types";
import type * as Errors from "./errors";
import type { ElementaryValue, UintValue, IntValue, BoolValue, BytesStaticValue, BytesDynamicValue, BytesValue, AddressValue, StringValue, FixedValue, UfixedValue, EnumValue, UserDefinedValueTypeValue, ContractValue, ContractValueInfoKnown, ContractValueInfoUnknown } from "./elementary";
import type * as Common from "../common";
import type * as Abi from "@truffle/abi-utils";
export * from "./elementary";
/**
 * This is the overall Result type.  It may encode an actual value or an error.
 *
 * @Category General categories
 */
export declare type Result = ElementaryResult | ArrayResult | MappingResult | StructResult | TupleResult | MagicResult | TypeResult | FunctionExternalResult | FunctionInternalResult;
/**
 * An actual value, not an error (although if a container type it may contain errors!)
 *
 * @Category General categories
 */
export declare type Value = ElementaryValue | ArrayValue | MappingValue | StructValue | TupleValue | MagicValue | TypeValue | FunctionExternalValue | FunctionInternalValue;
/**
 * A value that can go in the ABI
 *
 * @Category General categories
 */
export declare type AbiValue = UintValue | IntValue | BoolValue | BytesValue | AddressValue | FixedValue | UfixedValue | StringValue | ArrayValue | FunctionExternalValue | TupleValue;
/**
 * A result for an ABI type
 *
 * @Category General categories
 */
export declare type AbiResult = UintResult | IntResult | BoolResult | BytesResult | AddressResult | FixedResult | UfixedResult | StringResult | ArrayResult | FunctionExternalResult | TupleResult;
/**
 * An elementary value or error
 *
 * @Category General categories
 */
export declare type ElementaryResult = UintResult | IntResult | BoolResult | BytesResult | AddressResult | StringResult | FixedResult | UfixedResult | EnumResult | UserDefinedValueTypeResult | ContractResult;
/**
 * A bytestring value or error (static or dynamic)
 *
 * @Category Elementary types
 */
export declare type BytesResult = BytesStaticResult | BytesDynamicResult;
/**
 * An unsigned integer value or error
 *
 * @Category Elementary types
 */
export declare type UintResult = UintValue | Errors.UintErrorResult;
/**
 * A signed integer value or error
 *
 * @Category Elementary types
 */
export declare type IntResult = IntValue | Errors.IntErrorResult;
/**
 * A boolean value or error
 *
 * @Category Elementary types
 */
export declare type BoolResult = BoolValue | Errors.BoolErrorResult;
/**
 * A bytestring value or error (static-length)
 *
 * @Category Elementary types
 */
export declare type BytesStaticResult = BytesStaticValue | Errors.BytesStaticErrorResult;
/**
 * A bytestring value or error (dynamic-length)
 *
 * @Category Elementary types
 */
export declare type BytesDynamicResult = BytesDynamicValue | Errors.BytesDynamicErrorResult;
/**
 * An address value or error
 *
 * @Category Elementary types
 */
export declare type AddressResult = AddressValue | Errors.AddressErrorResult;
/**
 * A string value or error
 *
 * @Category Elementary types
 */
export declare type StringResult = StringValue | Errors.StringErrorResult;
/**
 * A signed fixed-point value or error
 *
 * @Category Elementary types
 */
export declare type FixedResult = FixedValue | Errors.FixedErrorResult;
/**
 * An unsigned fixed-point value or error
 *
 * @Category Elementary types
 */
export declare type UfixedResult = UfixedValue | Errors.UfixedErrorResult;
/**
 * An enum value or error
 *
 * @Category User-defined elementary types
 */
export declare type EnumResult = EnumValue | Errors.EnumErrorResult;
/**
 * A UDVT value or error
 *
 * @Category User-defined elementary types
 */
export declare type UserDefinedValueTypeResult = UserDefinedValueTypeValue | Errors.UserDefinedValueTypeErrorResult;
/**
 * A contract value or error
 *
 * @Category User-defined elementary types
 */
export declare type ContractResult = ContractValue | Errors.ContractErrorResult;
/**
 * An array value or error
 *
 * @Category Container types
 */
export declare type ArrayResult = ArrayValue | Errors.ArrayErrorResult;
/**
 * An array value (may contain errors!)
 *
 * @Category Container types
 */
export interface ArrayValue {
    type: Types.ArrayType;
    kind: "value";
    /**
     * will be used in the future for circular vales
     */
    reference?: number;
    value: Result[];
}
/**
 * A mapping value or error
 *
 * @Category Container types
 */
export declare type MappingResult = MappingValue | Errors.MappingErrorResult;
/**
 * A mapping value (may contain errors!)
 *
 * @Category Container types
 */
export interface MappingValue {
    type: Types.MappingType;
    kind: "value";
    /**
     * order is irrelevant; also note keys must be values, not errors
     */
    value: KeyValuePair[];
}
export interface KeyValuePair {
    key: ElementaryValue;
    value: Result;
}
/**
 * A struct value or error
 *
 * @Category Container types
 */
export declare type StructResult = StructValue | Errors.StructErrorResult;
/**
 * A struct value (may contain errors!)
 *
 * @Category Container types
 */
export interface StructValue {
    type: Types.StructType;
    kind: "value";
    /**
     * will be used in the future for circular vales
     */
    reference?: number;
    /**
     * these must be stored in order!
     * moreover, any mappings *must* be included, even
     * if this is a memory struct (such mappings will be empty)
     */
    value: NameValuePair[];
}
export interface NameValuePair {
    name: string;
    value: Result;
}
/**
 * A tuple value or error
 *
 * @Category Container types
 */
export declare type TupleResult = TupleValue | Errors.TupleErrorResult;
/**
 * A tuple value (may contain errors!)
 *
 * @Category Container types
 */
export interface TupleValue {
    type: Types.TupleType;
    kind: "value";
    value: OptionallyNamedValue[];
}
export interface OptionallyNamedValue {
    name?: string;
    value: Result;
}
/**
 * A magic variable's value (or error)
 *
 * @Category Special container types (debugger-only)
 */
export declare type MagicResult = MagicValue | Errors.MagicErrorResult;
/**
 * A magic variable's value (may contain errors?)
 *
 * @Category Special container types (debugger-only)
 */
export interface MagicValue {
    type: Types.MagicType;
    kind: "value";
    value: {
        [field: string]: Result;
    };
}
/**
 * A type's value (or error); currently only allows contract types and
 * enum types
 *
 * @Category Special container types (debugger-only)
 */
export declare type TypeResult = TypeValue | Errors.TypeErrorResult;
/**
 * A type's value -- for now, we consider the value of a contract type to
 * consist of the values of its non-inherited state variables in the current
 * context, and the value of an enum type to be an array of its possible options
 * (as Values).  May contain errors.
 *
 * @Category Special container types (debugger-only)
 */
export declare type TypeValue = TypeValueContract | TypeValueEnum;
/**
 * A contract type's value (see [[TypeValue]])
 *
 * @Category Special container types (debugger-only)
 */
export interface TypeValueContract {
    type: Types.TypeTypeContract;
    kind: "value";
    /**
     * these must be stored in order!
     */
    value: NameValuePair[];
}
/**
 * An enum type's value (see [[TypeValue]])
 *
 * @Category Special container types (debugger-only)
 */
export interface TypeValueEnum {
    type: Types.TypeTypeEnum;
    kind: "value";
    /**
     * these must be stored in order!
     */
    value: EnumValue[];
}
/**
 * An external function pointer value or error
 *
 * @Category Function types
 */
export declare type FunctionExternalResult = FunctionExternalValue | Errors.FunctionExternalErrorResult;
/**
 * An external function pointer value; see [[FunctionExternalValueInfo]] for more detail
 *
 * @Category Function types
 */
export interface FunctionExternalValue {
    type: Types.FunctionExternalType;
    kind: "value";
    value: FunctionExternalValueInfo;
}
/**
 * External function values come in 3 types:
 * 1. known function of known class
 * 2. known class, but can't locate function
 * 3. can't determine class
 *
 * @Category Function types
 */
export declare type FunctionExternalValueInfo = FunctionExternalValueInfoKnown | FunctionExternalValueInfoInvalid | FunctionExternalValueInfoUnknown;
/**
 * This type of FunctionExternalValueInfo is used for a known function of a known class.
 *
 * @Category Function types
 */
export interface FunctionExternalValueInfoKnown {
    kind: "known";
    contract: ContractValueInfoKnown;
    /**
     * formatted as a hex string
     */
    selector: string;
    abi: Abi.FunctionEntry;
}
/**
 * This type of FunctionExternalValueInfo is used when we can identify the class but can't locate the function.
 *
 * @Category Function types
 */
export interface FunctionExternalValueInfoInvalid {
    kind: "invalid";
    contract: ContractValueInfoKnown;
    /**
     * formatted as a hex string
     */
    selector: string;
}
/**
 * This type of FunctionExternalValueInfo is used when we can't even locate the class.
 *
 * @Category Function types
 */
export interface FunctionExternalValueInfoUnknown {
    kind: "unknown";
    contract: ContractValueInfoUnknown;
    /**
     * formatted as a hex string
     */
    selector: string;
}
/**
 * An internal function pointer value or error
 *
 * @Category Function types
 */
export declare type FunctionInternalResult = FunctionInternalValue | Errors.FunctionInternalErrorResult;
/**
 * An internal function pointer value; see [[FunctionInternalValueInfo]] for more detail
 *
 * @Category Function types
 */
export interface FunctionInternalValue {
    type: Types.FunctionInternalType;
    kind: "value";
    value: FunctionInternalValueInfo;
}
/**
 * Internal functions come in three types:
 * 1. An actual function,
 * 2. A default value,
 * 3. A special value to indicate that decoding internal functions isn't supported in this context.
 *
 * @Category Function types
 */
export declare type FunctionInternalValueInfo = FunctionInternalValueInfoKnown | FunctionInternalValueInfoException | FunctionInternalValueInfoUnknown;
/**
 * This type of FunctionInternalValueInfo is used for an actual internal function.
 *
 * @Category Function types
 */
export interface FunctionInternalValueInfoKnown {
    kind: "function";
    context: Types.ContractType;
    deployedProgramCounter: number;
    constructorProgramCounter: number;
    name: string;
    /**
     * Is null for a free function
     */
    definedIn: Types.ContractType | null;
    /**
     * An internal opaque ID
     */
    id: string;
    mutability?: Common.Mutability;
}
/**
 * A default value -- internal functions have two default values
 * depending on whether they live in storage or elsewhere.
 * In storage the default value is 0 for both program counters.
 * Elsewhere they're both nonzero.
 *
 * @Category Function types
 */
export interface FunctionInternalValueInfoException {
    kind: "exception";
    context: Types.ContractType;
    deployedProgramCounter: number;
    constructorProgramCounter: number;
}
/**
 * This type is used when decoding internal functions in contexts that don't
 * support full decoding of such functions.  The high-level decoding interface
 * can currently only sometimes perform such a full decoding.
 *
 * In contexts where such full decoding isn't supported, you'll get one of
 * these; so you'll still get the program counter values, but further
 * information will be absent.  Note you'll get this even if really it should
 * decode to an error, because if there's insufficient information to determine
 * additional function information, there's necessarily insufficient
 * information to determine if it should be an error.
 *
 * @Category Function types
 */
export interface FunctionInternalValueInfoUnknown {
    kind: "unknown";
    context: Types.ContractType;
    deployedProgramCounter: number;
    constructorProgramCounter: number;
}
