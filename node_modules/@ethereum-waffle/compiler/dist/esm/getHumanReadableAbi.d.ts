export declare function getHumanReadableAbi(abi: any[]): string[];
interface SolidityValue {
    type: string;
    name?: string;
    indexed?: boolean;
    components?: SolidityValue[];
}
export declare function encodeSolidityValue({ type, components, indexed, name }: SolidityValue): string;
export {};
