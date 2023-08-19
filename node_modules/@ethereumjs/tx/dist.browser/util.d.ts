import Common from '@ethereumjs/common';
import { AccessList, AccessListBuffer } from './types';
export declare class AccessLists {
    static getAccessListData(accessList: AccessListBuffer | AccessList): {
        AccessListJSON: AccessList;
        accessList: AccessListBuffer;
    };
    static verifyAccessList(accessList: AccessListBuffer): void;
    static getAccessListJSON(accessList: AccessListBuffer): any[];
    static getDataFeeEIP2930(accessList: AccessListBuffer, common: Common): number;
}
