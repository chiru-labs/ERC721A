import Common from 'ethereumjs-common';
export interface Opcode {
    name: string;
    fee: number;
    isAsync: boolean;
}
export interface OpcodeList {
    [code: number]: Opcode;
}
export declare function getOpcodesForHF(common: Common): {
    [x: number]: Opcode;
};
