"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
var merkle_patricia_tree_1 = require("merkle-patricia-tree");
var ethereumjs_util_1 = require("ethereumjs-util");
var common_1 = require("@ethereumjs/common");
var tx_1 = require("@ethereumjs/tx");
var header_1 = require("./header");
/**
 * An object that represents the block.
 */
var Block = /** @class */ (function () {
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     * Use the static factory methods to assist in creating a Block object from varying data types and options.
     */
    function Block(header, transactions, uncleHeaders, opts) {
        if (transactions === void 0) { transactions = []; }
        if (uncleHeaders === void 0) { uncleHeaders = []; }
        if (opts === void 0) { opts = {}; }
        var _a;
        this.transactions = [];
        this.uncleHeaders = [];
        this.txTrie = new merkle_patricia_tree_1.BaseTrie();
        this.header = header !== null && header !== void 0 ? header : header_1.BlockHeader.fromHeaderData({}, opts);
        this.transactions = transactions;
        this.uncleHeaders = uncleHeaders;
        this._common = this.header._common;
        if (uncleHeaders.length > 0) {
            if (this._common.consensusType() === common_1.ConsensusType.ProofOfAuthority) {
                var msg = this._errorMsg('Block initialization with uncleHeaders on a PoA network is not allowed');
                throw new Error(msg);
            }
            if (this._common.consensusType() === common_1.ConsensusType.ProofOfStake) {
                var msg = this._errorMsg('Block initialization with uncleHeaders on a PoS network is not allowed');
                throw new Error(msg);
            }
        }
        var freeze = (_a = opts === null || opts === void 0 ? void 0 : opts.freeze) !== null && _a !== void 0 ? _a : true;
        if (freeze) {
            Object.freeze(this);
        }
    }
    /**
     * Static constructor to create a block from a block data dictionary
     *
     * @param blockData
     * @param opts
     */
    Block.fromBlockData = function (blockData, opts) {
        var e_1, _a, e_2, _b;
        if (blockData === void 0) { blockData = {}; }
        var headerData = blockData.header, txsData = blockData.transactions, uhsData = blockData.uncleHeaders;
        var header = header_1.BlockHeader.fromHeaderData(headerData, opts);
        // parse transactions
        var transactions = [];
        try {
            for (var _c = __values(txsData !== null && txsData !== void 0 ? txsData : []), _d = _c.next(); !_d.done; _d = _c.next()) {
                var txData = _d.value;
                var tx = tx_1.TransactionFactory.fromTxData(txData, __assign(__assign({}, opts), { 
                    // Use header common in case of hardforkByBlockNumber being activated
                    common: header._common }));
                transactions.push(tx);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // parse uncle headers
        var uncleHeaders = [];
        var uncleOpts = __assign(__assign({ hardforkByBlockNumber: true }, opts), { 
            // Use header common in case of hardforkByBlockNumber being activated
            common: header._common, 
            // Disable this option here (all other options carried over), since this overwrites the provided Difficulty to an incorrect value
            calcDifficultyFromHeader: undefined, 
            // Uncles are obsolete post-merge (no use for hardforkByTD)
            hardforkByTD: undefined });
        try {
            for (var _e = __values(uhsData !== null && uhsData !== void 0 ? uhsData : []), _f = _e.next(); !_f.done; _f = _e.next()) {
                var uhData = _f.value;
                var uh = header_1.BlockHeader.fromHeaderData(uhData, uncleOpts);
                uncleHeaders.push(uh);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return new Block(header, transactions, uncleHeaders, opts);
    };
    /**
     * Static constructor to create a block from a RLP-serialized block
     *
     * @param serialized
     * @param opts
     */
    Block.fromRLPSerializedBlock = function (serialized, opts) {
        var values = ethereumjs_util_1.rlp.decode(serialized);
        if (!Array.isArray(values)) {
            throw new Error('Invalid serialized block input. Must be array');
        }
        return Block.fromValuesArray(values, opts);
    };
    /**
     * Static constructor to create a block from an array of Buffer values
     *
     * @param values
     * @param opts
     */
    Block.fromValuesArray = function (values, opts) {
        var e_3, _a, e_4, _b;
        if (values.length > 3) {
            throw new Error('invalid block. More values than expected were received');
        }
        var _c = __read(values, 3), headerData = _c[0], txsData = _c[1], uhsData = _c[2];
        var header = header_1.BlockHeader.fromValuesArray(headerData, opts);
        // parse transactions
        var transactions = [];
        try {
            for (var _d = __values(txsData || []), _e = _d.next(); !_e.done; _e = _d.next()) {
                var txData = _e.value;
                transactions.push(tx_1.TransactionFactory.fromBlockBodyData(txData, __assign(__assign({}, opts), { 
                    // Use header common in case of hardforkByBlockNumber being activated
                    common: header._common })));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // parse uncle headers
        var uncleHeaders = [];
        var uncleOpts = __assign(__assign({ hardforkByBlockNumber: true }, opts), { 
            // Use header common in case of hardforkByBlockNumber being activated
            common: header._common, 
            // Disable this option here (all other options carried over), since this overwrites the provided Difficulty to an incorrect value
            calcDifficultyFromHeader: undefined });
        if (uncleOpts.hardforkByTD) {
            delete uncleOpts.hardforkByBlockNumber;
        }
        try {
            for (var _f = __values(uhsData || []), _g = _f.next(); !_g.done; _g = _f.next()) {
                var uncleHeaderData = _g.value;
                uncleHeaders.push(header_1.BlockHeader.fromValuesArray(uncleHeaderData, uncleOpts));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return new Block(header, transactions, uncleHeaders, opts);
    };
    /**
     * Alias for {@link Block.fromBlockData} with {@link BlockOptions.initWithGenesisHeader} set to true.
     */
    Block.genesis = function (blockData, opts) {
        if (blockData === void 0) { blockData = {}; }
        opts = __assign(__assign({}, opts), { initWithGenesisHeader: true });
        return Block.fromBlockData(blockData, opts);
    };
    /**
     * Returns a Buffer Array of the raw Buffers of this block, in order.
     */
    Block.prototype.raw = function () {
        return [
            this.header.raw(),
            this.transactions.map(function (tx) {
                return tx.supports(tx_1.Capability.EIP2718TypedTransaction) ? tx.serialize() : tx.raw();
            }),
            this.uncleHeaders.map(function (uh) { return uh.raw(); }),
        ];
    };
    /**
     * Produces a hash the RLP of the block.
     */
    Block.prototype.hash = function () {
        return this.header.hash();
    };
    /**
     * Determines if this block is the genesis block.
     */
    Block.prototype.isGenesis = function () {
        return this.header.isGenesis();
    };
    /**
     * Returns the rlp encoding of the block.
     */
    Block.prototype.serialize = function () {
        return ethereumjs_util_1.rlp.encode(this.raw());
    };
    /**
     * Generates transaction trie for validation.
     */
    Block.prototype.genTxTrie = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, transactions, txTrie, i, tx, key, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, transactions = _a.transactions, txTrie = _a.txTrie;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < transactions.length)) return [3 /*break*/, 4];
                        tx = transactions[i];
                        key = ethereumjs_util_1.rlp.encode(i);
                        value = tx.serialize();
                        return [4 /*yield*/, txTrie.put(key, value)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validates the transaction trie by generating a trie
     * and do a check on the root hash.
     */
    Block.prototype.validateTransactionsTrie = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.transactions.length === 0) {
                            result = this.header.transactionsTrie.equals(ethereumjs_util_1.KECCAK256_RLP);
                            return [2 /*return*/, result];
                        }
                        if (!this.txTrie.root.equals(ethereumjs_util_1.KECCAK256_RLP)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.genTxTrie()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        result = this.txTrie.root.equals(this.header.transactionsTrie);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Block.prototype.validateTransactions = function (stringError) {
        var _this = this;
        if (stringError === void 0) { stringError = false; }
        var errors = [];
        this.transactions.forEach(function (tx, i) {
            var errs = tx.validate(true);
            if (_this._common.isActivatedEIP(1559)) {
                if (tx.supports(tx_1.Capability.EIP1559FeeMarket)) {
                    tx = tx;
                    if (tx.maxFeePerGas.lt(_this.header.baseFeePerGas)) {
                        errs.push('tx unable to pay base fee (EIP-1559 tx)');
                    }
                }
                else {
                    tx = tx;
                    if (tx.gasPrice.lt(_this.header.baseFeePerGas)) {
                        errs.push('tx unable to pay base fee (non EIP-1559 tx)');
                    }
                }
            }
            if (errs.length > 0) {
                errors.push("errors at tx " + i + ": " + errs.join(', '));
            }
        });
        return stringError ? errors : errors.length === 0;
    };
    /**
     * Performs the following consistency checks on the block:
     *
     * - Value checks on the header fields
     * - Signature and gasLimit validation for included txs
     * - Validation of the tx trie
     * - Consistency checks and header validation of included uncles
     *
     * Throws if invalid.
     *
     * @param blockchain - validate against an @ethereumjs/blockchain
     * @param onlyHeader - if should only validate the header (skips validating txTrie and unclesHash) (default: false)
     */
    Block.prototype.validate = function (blockchain, onlyHeader) {
        if (onlyHeader === void 0) { onlyHeader = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.header.validate(blockchain)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.validateUncles(blockchain)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.validateData(onlyHeader)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validates the block data, throwing if invalid.
     * This can be checked on the Block itself without needing access to any parent block
     * It checks:
     * - All transactions are valid
     * - The transactions trie is valid
     * - The uncle hash is valid
     * @param onlyHeader if only passed the header, skip validating txTrie and unclesHash (default: false)
     */
    Block.prototype.validateData = function (onlyHeader) {
        if (onlyHeader === void 0) { onlyHeader = false; }
        return __awaiter(this, void 0, void 0, function () {
            var txErrors, msg, validateTxTrie, msg, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txErrors = this.validateTransactions(true);
                        if (txErrors.length > 0) {
                            msg = this._errorMsg("invalid transactions: " + txErrors.join(' '));
                            throw new Error(msg);
                        }
                        if (onlyHeader) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.validateTransactionsTrie()];
                    case 1:
                        validateTxTrie = _a.sent();
                        if (!validateTxTrie) {
                            msg = this._errorMsg('invalid transaction trie');
                            throw new Error(msg);
                        }
                        if (!this.validateUnclesHash()) {
                            msg = this._errorMsg('invalid uncle hash');
                            throw new Error(msg);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validates the uncle's hash.
     */
    Block.prototype.validateUnclesHash = function () {
        var raw = ethereumjs_util_1.rlp.encode(this.uncleHeaders.map(function (uh) { return uh.raw(); }));
        return (0, ethereumjs_util_1.keccak256)(raw).equals(this.header.uncleHash);
    };
    /**
     * Consistency checks and header validation for uncles included,
     * in the block, if any.
     *
     * Throws if invalid.
     *
     * The rules of uncles are the following:
     * Uncle Header is a valid header.
     * Uncle Header is an orphan, i.e. it is not one of the headers of the canonical chain.
     * Uncle Header has a parentHash which points to the canonical chain. This parentHash is within the last 7 blocks.
     * Uncle Header is not already included as uncle in another block.
     * Header has at most 2 uncles.
     * Header does not count an uncle twice.
     *
     * @param blockchain - additionally validate against an @ethereumjs/blockchain instance
     */
    Block.prototype.validateUncles = function (blockchain) {
        return __awaiter(this, void 0, void 0, function () {
            var msg, uncleHashes, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isGenesis()) {
                            return [2 /*return*/];
                        }
                        // Header has at most 2 uncles
                        if (this.uncleHeaders.length > 2) {
                            msg = this._errorMsg('too many uncle headers');
                            throw new Error(msg);
                        }
                        uncleHashes = this.uncleHeaders.map(function (header) { return header.hash().toString('hex'); });
                        if (!(new Set(uncleHashes).size === uncleHashes.length)) {
                            msg = this._errorMsg('duplicate uncles');
                            throw new Error(msg);
                        }
                        return [4 /*yield*/, this._validateUncleHeaders(this.uncleHeaders, blockchain)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the canonical difficulty for this block.
     *
     * @param parentBlock - the parent of this `Block`
     */
    Block.prototype.canonicalDifficulty = function (parentBlock) {
        return this.header.canonicalDifficulty(parentBlock.header);
    };
    /**
     * Checks that the block's `difficulty` matches the canonical difficulty.
     *
     * @param parentBlock - the parent of this `Block`
     */
    Block.prototype.validateDifficulty = function (parentBlock) {
        return this.header.validateDifficulty(parentBlock.header);
    };
    /**
     * Validates if the block gasLimit remains in the
     * boundaries set by the protocol.
     *
     * @param parentBlock - the parent of this `Block`
     */
    Block.prototype.validateGasLimit = function (parentBlock) {
        return this.header.validateGasLimit(parentBlock.header);
    };
    /**
     * Returns the block in JSON format.
     */
    Block.prototype.toJSON = function () {
        return {
            header: this.header.toJSON(),
            transactions: this.transactions.map(function (tx) { return tx.toJSON(); }),
            uncleHeaders: this.uncleHeaders.map(function (uh) { return uh.toJSON(); }),
        };
    };
    /**
     * The following rules are checked in this method:
     * Uncle Header is a valid header.
     * Uncle Header is an orphan, i.e. it is not one of the headers of the canonical chain.
     * Uncle Header has a parentHash which points to the canonical chain. This parentHash is within the last 7 blocks.
     * Uncle Header is not already included as uncle in another block.
     * @param uncleHeaders - list of uncleHeaders
     * @param blockchain - pointer to the blockchain
     */
    Block.prototype._validateUncleHeaders = function (uncleHeaders, blockchain) {
        return __awaiter(this, void 0, void 0, function () {
            var canonicalBlockMap, lowestUncleNumber, canonicalChainHashes, includedUncles, getBlocks, parentHash, i, parentBlock, msg;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (uncleHeaders.length == 0) {
                            return [2 /*return*/];
                        }
                        // Each Uncle Header is a valid header
                        return [4 /*yield*/, Promise.all(uncleHeaders.map(function (uh) { return uh.validate(blockchain, _this.header.number); }))
                            // Check how many blocks we should get in order to validate the uncle.
                            // In the worst case, we get 8 blocks, in the best case, we only get 1 block.
                        ];
                    case 1:
                        // Each Uncle Header is a valid header
                        _a.sent();
                        canonicalBlockMap = [];
                        lowestUncleNumber = this.header.number.clone();
                        uncleHeaders.map(function (header) {
                            if (header.number.lt(lowestUncleNumber)) {
                                lowestUncleNumber = header.number.clone();
                            }
                        });
                        canonicalChainHashes = {};
                        includedUncles = {};
                        getBlocks = this.header.number.clone().sub(lowestUncleNumber).addn(1).toNumber();
                        parentHash = this.header.parentHash;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < getBlocks)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._getBlockByHash(blockchain, parentHash)];
                    case 3:
                        parentBlock = _a.sent();
                        if (!parentBlock) {
                            msg = this._errorMsg('could not find parent block');
                            throw new Error(msg);
                        }
                        canonicalBlockMap.push(parentBlock);
                        // mark block hash as part of the canonical chain
                        canonicalChainHashes[parentBlock.hash().toString('hex')] = true;
                        // for each of the uncles, mark the uncle as included
                        parentBlock.uncleHeaders.map(function (uh) {
                            includedUncles[uh.hash().toString('hex')] = true;
                        });
                        parentHash = parentBlock.header.parentHash;
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        // Here we check:
                        // Uncle Header is an orphan, i.e. it is not one of the headers of the canonical chain.
                        // Uncle Header is not already included as uncle in another block.
                        // Uncle Header has a parentHash which points to the canonical chain.
                        uncleHeaders.map(function (uh) {
                            var uncleHash = uh.hash().toString('hex');
                            var parentHash = uh.parentHash.toString('hex');
                            if (!canonicalChainHashes[parentHash]) {
                                var msg = _this._errorMsg('The parent hash of the uncle header is not part of the canonical chain');
                                throw new Error(msg);
                            }
                            if (includedUncles[uncleHash]) {
                                var msg = _this._errorMsg('The uncle is already included in the canonical chain');
                                throw new Error(msg);
                            }
                            if (canonicalChainHashes[uncleHash]) {
                                var msg = _this._errorMsg('The uncle is a canonical block');
                                throw new Error(msg);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Block.prototype._getBlockByHash = function (blockchain, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var block, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, blockchain.getBlock(hash)];
                    case 1:
                        block = _a.sent();
                        return [2 /*return*/, block];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1.type === 'NotFoundError') {
                            return [2 /*return*/, undefined];
                        }
                        else {
                            throw error_1;
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Return a compact error string representation of the object
     */
    Block.prototype.errorStr = function () {
        var _a;
        var hash = '';
        try {
            hash = (0, ethereumjs_util_1.bufferToHex)(this.hash());
        }
        catch (e) {
            hash = 'error';
        }
        var hf = '';
        try {
            hf = this._common.hardfork();
        }
        catch (e) {
            hf = 'error';
        }
        var errorStr = "block number=" + this.header.number + " hash=" + hash + " ";
        errorStr += "hf=" + hf + " baseFeePerGas=" + ((_a = this.header.baseFeePerGas) !== null && _a !== void 0 ? _a : 'none') + " ";
        errorStr += "txs=" + this.transactions.length + " uncles=" + this.uncleHeaders.length;
        return errorStr;
    };
    /**
     * Internal helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    Block.prototype._errorMsg = function (msg) {
        return msg + " (" + this.errorStr() + ")";
    };
    return Block;
}());
exports.Block = Block;
//# sourceMappingURL=block.js.map