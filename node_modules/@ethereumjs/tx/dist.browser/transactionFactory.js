"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ethereumjs_util_1 = require("ethereumjs-util");
var _1 = require(".");
var TransactionFactory = /** @class */ (function () {
    // It is not possible to instantiate a TransactionFactory object.
    function TransactionFactory() {
    }
    /**
     * Create a transaction from a `txData` object
     *
     * @param txData - The transaction data. The `type` field will determine which transaction type is returned (if undefined, creates a legacy transaction)
     * @param txOptions - Options to pass on to the constructor of the transaction
     */
    TransactionFactory.fromTxData = function (txData, txOptions) {
        if (txOptions === void 0) { txOptions = {}; }
        if (!('type' in txData) || txData.type === undefined) {
            // Assume legacy transaction
            return _1.Transaction.fromTxData(txData, txOptions);
        }
        else {
            var txType = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(txData.type)).toNumber();
            if (txType === 0) {
                return _1.Transaction.fromTxData(txData, txOptions);
            }
            else if (txType === 1) {
                return _1.AccessListEIP2930Transaction.fromTxData(txData, txOptions);
            }
            else if (txType === 2) {
                return _1.FeeMarketEIP1559Transaction.fromTxData(txData, txOptions);
            }
            else {
                throw new Error("Tx instantiation with type " + txType + " not supported");
            }
        }
    };
    /**
     * This method tries to decode serialized data.
     *
     * @param data - The data Buffer
     * @param txOptions - The transaction options
     */
    TransactionFactory.fromSerializedData = function (data, txOptions) {
        if (txOptions === void 0) { txOptions = {}; }
        if (data[0] <= 0x7f) {
            // Determine the type.
            var EIP = void 0;
            switch (data[0]) {
                case 1:
                    EIP = 2930;
                    break;
                case 2:
                    EIP = 1559;
                    break;
                default:
                    throw new Error("TypedTransaction with ID " + data[0] + " unknown");
            }
            if (EIP === 1559) {
                return _1.FeeMarketEIP1559Transaction.fromSerializedTx(data, txOptions);
            }
            else {
                // EIP === 2930
                return _1.AccessListEIP2930Transaction.fromSerializedTx(data, txOptions);
            }
        }
        else {
            return _1.Transaction.fromSerializedTx(data, txOptions);
        }
    };
    /**
     * When decoding a BlockBody, in the transactions field, a field is either:
     * A Buffer (a TypedTransaction - encoded as TransactionType || rlp(TransactionPayload))
     * A Buffer[] (Legacy Transaction)
     * This method returns the right transaction.
     *
     * @param data - A Buffer or Buffer[]
     * @param txOptions - The transaction options
     */
    TransactionFactory.fromBlockBodyData = function (data, txOptions) {
        if (txOptions === void 0) { txOptions = {}; }
        if (Buffer.isBuffer(data)) {
            return this.fromSerializedData(data, txOptions);
        }
        else if (Array.isArray(data)) {
            // It is a legacy transaction
            return _1.Transaction.fromValuesArray(data, txOptions);
        }
        else {
            throw new Error('Cannot decode transaction: unknown type input');
        }
    };
    /**
     * This helper method allows one to retrieve the class which matches the transactionID
     * If transactionID is undefined, returns the legacy transaction class.
     * @deprecated - This method is deprecated and will be removed on the next major release
     * @param transactionID
     * @param _common - This option is not used
     */
    TransactionFactory.getTransactionClass = function (transactionID, _common) {
        if (transactionID === void 0) { transactionID = 0; }
        var legacyTxn = transactionID == 0 || (transactionID >= 0x80 && transactionID <= 0xff);
        if (legacyTxn) {
            return _1.Transaction;
        }
        switch (transactionID) {
            case 1:
                return _1.AccessListEIP2930Transaction;
            case 2:
                return _1.FeeMarketEIP1559Transaction;
            default:
                throw new Error("TypedTransaction with ID " + transactionID + " unknown");
        }
    };
    return TransactionFactory;
}());
exports.default = TransactionFactory;
//# sourceMappingURL=transactionFactory.js.map