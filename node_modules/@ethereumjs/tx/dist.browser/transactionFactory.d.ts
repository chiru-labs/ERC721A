/// <reference types="node" />
import { TxOptions, TypedTransaction, TxData, AccessListEIP2930TxData, FeeMarketEIP1559TxData } from './types';
import { Transaction, AccessListEIP2930Transaction, FeeMarketEIP1559Transaction } from '.';
import Common from '@ethereumjs/common';
export default class TransactionFactory {
    private constructor();
    /**
     * Create a transaction from a `txData` object
     *
     * @param txData - The transaction data. The `type` field will determine which transaction type is returned (if undefined, creates a legacy transaction)
     * @param txOptions - Options to pass on to the constructor of the transaction
     */
    static fromTxData(txData: TxData | AccessListEIP2930TxData | FeeMarketEIP1559TxData, txOptions?: TxOptions): TypedTransaction;
    /**
     * This method tries to decode serialized data.
     *
     * @param data - The data Buffer
     * @param txOptions - The transaction options
     */
    static fromSerializedData(data: Buffer, txOptions?: TxOptions): TypedTransaction;
    /**
     * When decoding a BlockBody, in the transactions field, a field is either:
     * A Buffer (a TypedTransaction - encoded as TransactionType || rlp(TransactionPayload))
     * A Buffer[] (Legacy Transaction)
     * This method returns the right transaction.
     *
     * @param data - A Buffer or Buffer[]
     * @param txOptions - The transaction options
     */
    static fromBlockBodyData(data: Buffer | Buffer[], txOptions?: TxOptions): TypedTransaction;
    /**
     * This helper method allows one to retrieve the class which matches the transactionID
     * If transactionID is undefined, returns the legacy transaction class.
     * @deprecated - This method is deprecated and will be removed on the next major release
     * @param transactionID
     * @param _common - This option is not used
     */
    static getTransactionClass(transactionID?: number, _common?: Common): typeof Transaction | typeof AccessListEIP2930Transaction | typeof FeeMarketEIP1559Transaction;
}
