import type * as Common from "../common";
export interface TypeDescriptions {
    typeIdentifier: string;
    typeString?: string;
}
export interface AstNode {
    constant?: boolean;
    mutability?: "mutable" | "immutable" | "constant";
    id: number;
    name: string;
    canonicalName?: string;
    linearizedBaseContracts?: number[];
    members?: AstNode[];
    underlyingType?: AstNode;
    nodes?: AstNode[];
    nodeType: string;
    ast_type?: string;
    scope?: number;
    src: string;
    stateVariable?: boolean;
    storageLocation?: string;
    typeDescriptions: TypeDescriptions;
    typeName?: AstNode;
    expression?: {
        referencedDeclaration?: any;
    };
    value?: null | any;
    visibility?: string;
    stateMutability?: Common.Mutability;
    kind?: string;
    hexValue?: string;
    referencedDeclaration?: any;
    parameters?: {
        parameters: AstNode[];
    };
    returnParameters?: {
        parameters: AstNode[];
    };
    parameterTypes?: {
        parameters: AstNode[];
    };
    returnParameterTypes?: {
        parameters: AstNode[];
    };
    baseType?: AstNode;
    keyType?: AstNode;
    valueType?: AstNode;
    payable?: boolean;
    indexed?: boolean;
    anonymous?: boolean;
    contractKind?: Common.ContractKind;
    isConstructor?: boolean;
    usedErrors?: number[];
}
export interface AstNodes {
    [nodeId: number]: AstNode;
}
export interface Scopes {
    [nodeId: string]: {
        id: number;
        sourceId: string;
        parentId: number | null;
        pointer: string;
        variables?: {
            name: string;
            id: number;
        }[];
        definition?: AstNode;
    };
}
