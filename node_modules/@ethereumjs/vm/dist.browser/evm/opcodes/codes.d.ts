import Common from '@ethereumjs/common';
export declare class Opcode {
    readonly code: number;
    readonly name: string;
    readonly fullName: string;
    readonly fee: number;
    readonly isAsync: boolean;
    constructor({ code, name, fullName, fee, isAsync, }: {
        code: number;
        name: string;
        fullName: string;
        fee: number;
        isAsync: boolean;
    });
}
export declare type OpcodeList = Map<number, Opcode>;
/**
 * Get suitable opcodes for the required hardfork.
 *
 * @param common {Common} Ethereumjs Common metadata object.
 * @returns {OpcodeList} Opcodes dictionary object.
 */
export declare function getOpcodesForHF(common: Common): OpcodeList;
