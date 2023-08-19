/// <reference types="bn.js" />
import { Address, BN } from 'ethereumjs-util';
export default class TxContext {
    gasPrice: BN;
    origin: Address;
    constructor(gasPrice: BN, origin: Address);
}
