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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.BlockHeader = void 0;
var common_1 = __importStar(require("@ethereumjs/common"));
var ethereumjs_util_1 = require("ethereumjs-util");
var clique_1 = require("./clique");
var DEFAULT_GAS_LIMIT = new ethereumjs_util_1.BN(Buffer.from('ffffffffffffff', 'hex'));
/**
 * An object that represents the block header.
 */
var BlockHeader = /** @class */ (function () {
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     *
     * @deprecated - Use the public static factory methods to assist in creating a Header object from
     * varying data types. For a default empty header, use {@link BlockHeader.fromHeaderData}.
     *
     */
    function BlockHeader(parentHash, uncleHash, coinbase, stateRoot, transactionsTrie, receiptTrie, logsBloom, difficulty, number, gasLimit, gasUsed, timestamp, extraData, mixHash, nonce, options, baseFeePerGas) {
        if (options === void 0) { options = {}; }
        var _a, _b;
        this.cache = {
            hash: undefined,
        };
        if (options.common) {
            this._common = options.common.copy();
        }
        else {
            this._common = new common_1.default({
                chain: common_1.Chain.Mainnet, // default
            });
            if (options.initWithGenesisHeader) {
                this._common.setHardforkByBlockNumber(0);
            }
        }
        if (options.hardforkByBlockNumber !== undefined && options.hardforkByTD !== undefined) {
            throw new Error("The hardforkByBlockNumber and hardforkByTD options can't be used in conjunction");
        }
        var hardforkByBlockNumber = (_a = options.hardforkByBlockNumber) !== null && _a !== void 0 ? _a : false;
        if (hardforkByBlockNumber || options.hardforkByTD !== undefined) {
            this._common.setHardforkByBlockNumber(number, options.hardforkByTD);
        }
        if (this._common.isActivatedEIP(1559)) {
            if (baseFeePerGas === undefined) {
                baseFeePerGas = new ethereumjs_util_1.BN(7);
            }
        }
        else {
            if (baseFeePerGas) {
                throw new Error('A base fee for a block can only be set with EIP1559 being activated');
            }
        }
        if (options.initWithGenesisHeader) {
            number = new ethereumjs_util_1.BN(0);
            if (gasLimit.eq(DEFAULT_GAS_LIMIT)) {
                gasLimit = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(this._common.genesis().gasLimit));
            }
            if (timestamp.isZero()) {
                timestamp = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(this._common.genesis().timestamp));
            }
            if (difficulty.isZero()) {
                difficulty = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(this._common.genesis().difficulty));
            }
            if (extraData.length === 0) {
                extraData = (0, ethereumjs_util_1.toBuffer)(this._common.genesis().extraData);
            }
            if (nonce.equals((0, ethereumjs_util_1.zeros)(8))) {
                nonce = (0, ethereumjs_util_1.toBuffer)(this._common.genesis().nonce);
            }
            if (stateRoot.equals((0, ethereumjs_util_1.zeros)(32))) {
                stateRoot = (0, ethereumjs_util_1.toBuffer)(this._common.genesis().stateRoot);
            }
            if (this._common.gteHardfork(common_1.Hardfork.London) &&
                this._common.genesis().baseFeePerGas !== undefined) {
                baseFeePerGas = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(this._common.genesis().baseFeePerGas));
            }
        }
        this.parentHash = parentHash;
        this.uncleHash = uncleHash;
        this.coinbase = coinbase;
        this.stateRoot = stateRoot;
        this.transactionsTrie = transactionsTrie;
        this.receiptTrie = receiptTrie;
        this.logsBloom = logsBloom;
        this.difficulty = difficulty;
        this.number = number;
        this.gasLimit = gasLimit;
        this.gasUsed = gasUsed;
        this.timestamp = timestamp;
        this.extraData = extraData;
        this.mixHash = mixHash;
        this.nonce = nonce;
        this.baseFeePerGas = baseFeePerGas;
        this._validateHeaderFields();
        this._validateDAOExtraData();
        // Now we have set all the values of this Header, we possibly have set a dummy
        // `difficulty` value (defaults to 0). If we have a `calcDifficultyFromHeader`
        // block option parameter, we instead set difficulty to this value.
        if (options.calcDifficultyFromHeader &&
            this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Ethash) {
            this.difficulty = this.canonicalDifficulty(options.calcDifficultyFromHeader);
        }
        // If cliqueSigner is provided, seal block with provided privateKey.
        if (options.cliqueSigner) {
            // Ensure extraData is at least length CLIQUE_EXTRA_VANITY + CLIQUE_EXTRA_SEAL
            var minExtraDataLength = clique_1.CLIQUE_EXTRA_VANITY + clique_1.CLIQUE_EXTRA_SEAL;
            if (this.extraData.length < minExtraDataLength) {
                var remainingLength = minExtraDataLength - this.extraData.length;
                this.extraData = Buffer.concat([this.extraData, Buffer.alloc(remainingLength)]);
            }
            this.extraData = this.cliqueSealBlock(options.cliqueSigner);
        }
        var freeze = (_b = options === null || options === void 0 ? void 0 : options.freeze) !== null && _b !== void 0 ? _b : true;
        if (freeze) {
            Object.freeze(this);
        }
    }
    Object.defineProperty(BlockHeader.prototype, "bloom", {
        /**
         * Backwards compatible alias for {@link BlockHeader.logsBloom}
         * (planned to be removed in next major release)
         * @deprecated
         */
        get: function () {
            return this.logsBloom;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Static constructor to create a block header from a header data dictionary
     *
     * @param headerData
     * @param opts
     */
    BlockHeader.fromHeaderData = function (headerData, opts) {
        if (headerData === void 0) { headerData = {}; }
        if (opts === void 0) { opts = {}; }
        if (headerData.logsBloom === undefined && headerData.bloom !== undefined) {
            // backwards compatible alias for deprecated `bloom` key renamed to `logsBloom`
            // (planned to be removed in next major release)
            headerData.logsBloom = headerData.bloom;
        }
        var parentHash = headerData.parentHash, uncleHash = headerData.uncleHash, coinbase = headerData.coinbase, stateRoot = headerData.stateRoot, transactionsTrie = headerData.transactionsTrie, receiptTrie = headerData.receiptTrie, logsBloom = headerData.logsBloom, difficulty = headerData.difficulty, number = headerData.number, gasLimit = headerData.gasLimit, gasUsed = headerData.gasUsed, timestamp = headerData.timestamp, extraData = headerData.extraData, mixHash = headerData.mixHash, nonce = headerData.nonce, baseFeePerGas = headerData.baseFeePerGas;
        return new BlockHeader(parentHash ? (0, ethereumjs_util_1.toBuffer)(parentHash) : (0, ethereumjs_util_1.zeros)(32), uncleHash ? (0, ethereumjs_util_1.toBuffer)(uncleHash) : ethereumjs_util_1.KECCAK256_RLP_ARRAY, coinbase ? new ethereumjs_util_1.Address((0, ethereumjs_util_1.toBuffer)(coinbase)) : ethereumjs_util_1.Address.zero(), stateRoot ? (0, ethereumjs_util_1.toBuffer)(stateRoot) : (0, ethereumjs_util_1.zeros)(32), transactionsTrie ? (0, ethereumjs_util_1.toBuffer)(transactionsTrie) : ethereumjs_util_1.KECCAK256_RLP, receiptTrie ? (0, ethereumjs_util_1.toBuffer)(receiptTrie) : ethereumjs_util_1.KECCAK256_RLP, logsBloom ? (0, ethereumjs_util_1.toBuffer)(logsBloom) : (0, ethereumjs_util_1.zeros)(256), difficulty ? new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(difficulty)) : new ethereumjs_util_1.BN(0), number ? new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(number)) : new ethereumjs_util_1.BN(0), gasLimit ? new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(gasLimit)) : DEFAULT_GAS_LIMIT, gasUsed ? new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(gasUsed)) : new ethereumjs_util_1.BN(0), timestamp ? new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(timestamp)) : new ethereumjs_util_1.BN(0), extraData ? (0, ethereumjs_util_1.toBuffer)(extraData) : Buffer.from([]), mixHash ? (0, ethereumjs_util_1.toBuffer)(mixHash) : (0, ethereumjs_util_1.zeros)(32), nonce ? (0, ethereumjs_util_1.toBuffer)(nonce) : (0, ethereumjs_util_1.zeros)(8), opts, baseFeePerGas !== undefined && baseFeePerGas !== null
            ? new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(baseFeePerGas))
            : undefined);
    };
    /**
     * Static constructor to create a block header from a RLP-serialized header
     *
     * @param headerData
     * @param opts
     */
    BlockHeader.fromRLPSerializedHeader = function (serialized, opts) {
        if (opts === void 0) { opts = {}; }
        var values = ethereumjs_util_1.rlp.decode(serialized);
        if (!Array.isArray(values)) {
            throw new Error('Invalid serialized header input. Must be array');
        }
        return BlockHeader.fromValuesArray(values, opts);
    };
    /**
     * Static constructor to create a block header from an array of Buffer values
     *
     * @param headerData
     * @param opts
     */
    BlockHeader.fromValuesArray = function (values, opts) {
        if (opts === void 0) { opts = {}; }
        var _a = __read(values, 16), parentHash = _a[0], uncleHash = _a[1], coinbase = _a[2], stateRoot = _a[3], transactionsTrie = _a[4], receiptTrie = _a[5], logsBloom = _a[6], difficulty = _a[7], number = _a[8], gasLimit = _a[9], gasUsed = _a[10], timestamp = _a[11], extraData = _a[12], mixHash = _a[13], nonce = _a[14], baseFeePerGas = _a[15];
        if (values.length > 16) {
            throw new Error('invalid header. More values than expected were received');
        }
        if (values.length < 15) {
            throw new Error('invalid header. Less values than expected were received');
        }
        return new BlockHeader((0, ethereumjs_util_1.toBuffer)(parentHash), (0, ethereumjs_util_1.toBuffer)(uncleHash), new ethereumjs_util_1.Address((0, ethereumjs_util_1.toBuffer)(coinbase)), (0, ethereumjs_util_1.toBuffer)(stateRoot), (0, ethereumjs_util_1.toBuffer)(transactionsTrie), (0, ethereumjs_util_1.toBuffer)(receiptTrie), (0, ethereumjs_util_1.toBuffer)(logsBloom), new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(difficulty)), new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(number)), new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(gasLimit)), new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(gasUsed)), new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(timestamp)), (0, ethereumjs_util_1.toBuffer)(extraData), (0, ethereumjs_util_1.toBuffer)(mixHash), (0, ethereumjs_util_1.toBuffer)(nonce), opts, baseFeePerGas !== undefined && baseFeePerGas !== null
            ? new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(baseFeePerGas))
            : undefined);
    };
    /**
     * Alias for {@link BlockHeader.fromHeaderData} with {@link BlockOptions.initWithGenesisHeader} set to true.
     */
    BlockHeader.genesis = function (headerData, opts) {
        if (headerData === void 0) { headerData = {}; }
        opts = __assign(__assign({}, opts), { initWithGenesisHeader: true });
        return BlockHeader.fromHeaderData(headerData, opts);
    };
    /**
     * Validates correct buffer lengths, throws if invalid.
     */
    BlockHeader.prototype._validateHeaderFields = function () {
        var _a = this, parentHash = _a.parentHash, uncleHash = _a.uncleHash, stateRoot = _a.stateRoot, transactionsTrie = _a.transactionsTrie, receiptTrie = _a.receiptTrie, difficulty = _a.difficulty, 
        // extraData,
        mixHash = _a.mixHash, nonce = _a.nonce;
        if (parentHash.length !== 32) {
            var msg = this._errorMsg("parentHash must be 32 bytes, received " + parentHash.length + " bytes");
            throw new Error(msg);
        }
        if (stateRoot.length !== 32) {
            var msg = this._errorMsg("stateRoot must be 32 bytes, received " + stateRoot.length + " bytes");
            throw new Error(msg);
        }
        if (transactionsTrie.length !== 32) {
            var msg = this._errorMsg("transactionsTrie must be 32 bytes, received " + transactionsTrie.length + " bytes");
            throw new Error(msg);
        }
        if (receiptTrie.length !== 32) {
            var msg = this._errorMsg("receiptTrie must be 32 bytes, received " + receiptTrie.length + " bytes");
            throw new Error(msg);
        }
        if (mixHash.length !== 32) {
            var msg = this._errorMsg("mixHash must be 32 bytes, received " + mixHash.length + " bytes");
            throw new Error(msg);
        }
        if (nonce.length !== 8) {
            // Hack to check for Kovan due to non-standard nonce length (65 bytes)
            if (this._common.networkIdBN().eqn(42)) {
                if (nonce.length !== 65) {
                    var msg = this._errorMsg("nonce must be 65 bytes on kovan, received " + nonce.length + " bytes");
                    throw new Error(msg);
                }
            }
            else {
                var msg = this._errorMsg("nonce must be 8 bytes, received " + nonce.length + " bytes");
                throw new Error(msg);
            }
        }
        // Check for constant values for PoS blocks
        if (this._common.consensusType() === common_1.ConsensusType.ProofOfStake) {
            var error = false;
            var errorMsg = '';
            if (!uncleHash.equals(ethereumjs_util_1.KECCAK256_RLP_ARRAY)) {
                errorMsg += ", uncleHash: " + uncleHash.toString('hex') + " (expected: " + ethereumjs_util_1.KECCAK256_RLP_ARRAY.toString('hex') + ")";
                error = true;
            }
            if (!difficulty.eq(new ethereumjs_util_1.BN(0))) {
                errorMsg += ", difficulty: " + difficulty + " (expected: 0)";
                error = true;
            }
            // WIP from merge interop event:
            // extraData behavior pending consideration, for now allowed to be non-empty
            // if (!extraData.equals(Buffer.from([]))) {
            //   errorMsg += `, extraData: ${extraData.toString('hex')} (expected: '')`
            //   error = true
            // }
            if (!mixHash.equals((0, ethereumjs_util_1.zeros)(32))) {
                errorMsg += ", mixHash: " + mixHash.toString('hex') + " (expected: " + (0, ethereumjs_util_1.zeros)(32).toString('hex') + ")";
                error = true;
            }
            if (!nonce.equals((0, ethereumjs_util_1.zeros)(8))) {
                errorMsg += ", nonce: " + nonce.toString('hex') + " (expected: " + (0, ethereumjs_util_1.zeros)(8).toString('hex') + ")";
                error = true;
            }
            if (error) {
                var msg = this._errorMsg("Invalid PoS block" + errorMsg);
                throw new Error(msg);
            }
        }
    };
    /**
     * Returns the canonical difficulty for this block.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    BlockHeader.prototype.canonicalDifficulty = function (parentBlockHeader) {
        if (this._common.consensusType() !== common_1.ConsensusType.ProofOfWork) {
            var msg = this._errorMsg('difficulty calculation is only supported on PoW chains');
            throw new Error(msg);
        }
        if (this._common.consensusAlgorithm() !== common_1.ConsensusAlgorithm.Ethash) {
            var msg = this._errorMsg('difficulty calculation currently only supports the ethash algorithm');
            throw new Error(msg);
        }
        var hardfork = this._getHardfork();
        var blockTs = this.timestamp;
        var parentTs = parentBlockHeader.timestamp, parentDif = parentBlockHeader.difficulty;
        var minimumDifficulty = new ethereumjs_util_1.BN(this._common.paramByHardfork('pow', 'minimumDifficulty', hardfork));
        var offset = parentDif.div(new ethereumjs_util_1.BN(this._common.paramByHardfork('pow', 'difficultyBoundDivisor', hardfork)));
        var num = this.number.clone();
        // We use a ! here as TS cannot follow this hardfork-dependent logic, but it always gets assigned
        var dif;
        if (this._common.hardforkGteHardfork(hardfork, 'byzantium')) {
            // max((2 if len(parent.uncles) else 1) - ((timestamp - parent.timestamp) // 9), -99) (EIP100)
            var uncleAddend = parentBlockHeader.uncleHash.equals(ethereumjs_util_1.KECCAK256_RLP_ARRAY) ? 1 : 2;
            var a = blockTs.sub(parentTs).idivn(9).ineg().iaddn(uncleAddend);
            var cutoff = new ethereumjs_util_1.BN(-99);
            // MAX(cutoff, a)
            if (cutoff.gt(a)) {
                a = cutoff;
            }
            dif = parentDif.add(offset.mul(a));
        }
        if (this._common.hardforkGteHardfork(hardfork, 'byzantium')) {
            // Get delay as parameter from common
            num.isubn(this._common.param('pow', 'difficultyBombDelay'));
            if (num.ltn(0)) {
                num = new ethereumjs_util_1.BN(0);
            }
        }
        else if (this._common.hardforkGteHardfork(hardfork, 'homestead')) {
            // 1 - (block_timestamp - parent_timestamp) // 10
            var a = blockTs.sub(parentTs).idivn(10).ineg().iaddn(1);
            var cutoff = new ethereumjs_util_1.BN(-99);
            // MAX(cutoff, a)
            if (cutoff.gt(a)) {
                a = cutoff;
            }
            dif = parentDif.add(offset.mul(a));
        }
        else {
            // pre-homestead
            if (parentTs.addn(this._common.paramByHardfork('pow', 'durationLimit', hardfork)).gt(blockTs)) {
                dif = offset.add(parentDif);
            }
            else {
                dif = parentDif.sub(offset);
            }
        }
        var exp = num.divn(100000).isubn(2);
        if (!exp.isNeg()) {
            dif.iadd(new ethereumjs_util_1.BN(2).pow(exp));
        }
        if (dif.lt(minimumDifficulty)) {
            dif = minimumDifficulty;
        }
        return dif;
    };
    /**
     * Checks that the block's `difficulty` matches the canonical difficulty.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    BlockHeader.prototype.validateDifficulty = function (parentBlockHeader) {
        return this.canonicalDifficulty(parentBlockHeader).eq(this.difficulty);
    };
    /**
     * For poa, validates `difficulty` is correctly identified as INTURN or NOTURN.
     * Returns false if invalid.
     */
    BlockHeader.prototype.validateCliqueDifficulty = function (blockchain) {
        var _this = this;
        this._requireClique('validateCliqueDifficulty');
        if (!this.difficulty.eq(clique_1.CLIQUE_DIFF_INTURN) && !this.difficulty.eq(clique_1.CLIQUE_DIFF_NOTURN)) {
            var msg = this._errorMsg("difficulty for clique block must be INTURN (2) or NOTURN (1), received: " + this.difficulty);
            throw new Error(msg);
        }
        if ('cliqueActiveSigners' in blockchain === false) {
            var msg = this._errorMsg('PoA blockchain requires method blockchain.cliqueActiveSigners() to validate clique difficulty');
            throw new Error(msg);
        }
        var signers = blockchain.cliqueActiveSigners();
        if (signers.length === 0) {
            // abort if signers are unavailable
            return true;
        }
        var signerIndex = signers.findIndex(function (address) { return address.equals(_this.cliqueSigner()); });
        var inTurn = this.number.modn(signers.length) === signerIndex;
        if ((inTurn && this.difficulty.eq(clique_1.CLIQUE_DIFF_INTURN)) ||
            (!inTurn && this.difficulty.eq(clique_1.CLIQUE_DIFF_NOTURN))) {
            return true;
        }
        return false;
    };
    /**
     * Validates if the block gasLimit remains in the
     * boundaries set by the protocol.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    BlockHeader.prototype.validateGasLimit = function (parentBlockHeader) {
        var parentGasLimit = parentBlockHeader.gasLimit;
        // EIP-1559: assume double the parent gas limit on fork block
        // to adopt to the new gas target centered logic
        var londonHardforkBlock = this._common.hardforkBlockBN('london');
        if (londonHardforkBlock && this.number.eq(londonHardforkBlock)) {
            var elasticity = new ethereumjs_util_1.BN(this._common.param('gasConfig', 'elasticityMultiplier'));
            parentGasLimit = parentGasLimit.mul(elasticity);
        }
        var gasLimit = this.gasLimit;
        var hardfork = this._getHardfork();
        var a = parentGasLimit.div(new ethereumjs_util_1.BN(this._common.paramByHardfork('gasConfig', 'gasLimitBoundDivisor', hardfork)));
        var maxGasLimit = parentGasLimit.add(a);
        var minGasLimit = parentGasLimit.sub(a);
        var result = gasLimit.lt(maxGasLimit) &&
            gasLimit.gt(minGasLimit) &&
            gasLimit.gte(this._common.paramByHardfork('gasConfig', 'minGasLimit', hardfork));
        return result;
    };
    /**
     * Validates the block header, throwing if invalid. It is being validated against the reported `parentHash`.
     * It verifies the current block against the `parentHash`:
     * - The `parentHash` is part of the blockchain (it is a valid header)
     * - Current block number is parent block number + 1
     * - Current block has a strictly higher timestamp
     * - Additional PoW checks ->
     *   - Current block has valid difficulty and gas limit
     *   - In case that the header is an uncle header, it should not be too old or young in the chain.
     * - Additional PoA clique checks ->
     *   - Various extraData checks
     *   - Checks on coinbase and mixHash
     *   - Current block has a timestamp diff greater or equal to PERIOD
     *   - Current block has difficulty correctly marked as INTURN or NOTURN
     * @param blockchain - validate against an @ethereumjs/blockchain
     * @param height - If this is an uncle header, this is the height of the block that is including it
     */
    BlockHeader.prototype.validate = function (blockchain, height) {
        return __awaiter(this, void 0, void 0, function () {
            var hardfork, msg, minLength, msg, signerLength, msg, msg, msg, msg, parentHeader, msg, number, msg, msg, period, msg, msg, msg, dif, msg, msg, msg, block, isInitialEIP1559Block, initialBaseFee, msg, expectedBaseFee, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isGenesis()) {
                            return [2 /*return*/];
                        }
                        hardfork = this._getHardfork();
                        // Consensus type dependent checks
                        if (this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Ethash) {
                            // PoW/Ethash
                            if (this.extraData.length > this._common.paramByHardfork('vm', 'maxExtraDataSize', hardfork)) {
                                msg = this._errorMsg('invalid amount of extra data');
                                throw new Error(msg);
                            }
                        }
                        if (this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Clique) {
                            minLength = clique_1.CLIQUE_EXTRA_VANITY + clique_1.CLIQUE_EXTRA_SEAL;
                            if (!this.cliqueIsEpochTransition()) {
                                // ExtraData length on epoch transition
                                if (this.extraData.length !== minLength) {
                                    msg = this._errorMsg("extraData must be " + minLength + " bytes on non-epoch transition blocks, received " + this.extraData.length + " bytes");
                                    throw new Error(msg);
                                }
                            }
                            else {
                                signerLength = this.extraData.length - minLength;
                                if (signerLength % 20 !== 0) {
                                    msg = this._errorMsg("invalid signer list length in extraData, received signer length of " + signerLength + " (not divisible by 20)");
                                    throw new Error(msg);
                                }
                                // coinbase (beneficiary) on epoch transition
                                if (!this.coinbase.isZero()) {
                                    msg = this._errorMsg("coinbase must be filled with zeros on epoch transition blocks, received " + this.coinbase);
                                    throw new Error(msg);
                                }
                            }
                            // MixHash format
                            if (!this.mixHash.equals(Buffer.alloc(32))) {
                                msg = this._errorMsg("mixHash must be filled with zeros, received " + this.mixHash);
                                throw new Error(msg);
                            }
                            if (!this.validateCliqueDifficulty(blockchain)) {
                                msg = this._errorMsg("invalid clique difficulty");
                                throw new Error(msg);
                            }
                        }
                        return [4 /*yield*/, this._getHeaderByHash(blockchain, this.parentHash)];
                    case 1:
                        parentHeader = _a.sent();
                        if (!parentHeader) {
                            msg = this._errorMsg('could not find parent header');
                            throw new Error(msg);
                        }
                        number = this.number;
                        if (!number.eq(parentHeader.number.addn(1))) {
                            msg = this._errorMsg('invalid number');
                            throw new Error(msg);
                        }
                        if (this.timestamp.lte(parentHeader.timestamp)) {
                            msg = this._errorMsg('invalid timestamp');
                            throw new Error(msg);
                        }
                        if (this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Clique) {
                            period = this._common.consensusConfig().period;
                            // Timestamp diff between blocks is lower than PERIOD (clique)
                            if (parentHeader.timestamp.addn(period).gt(this.timestamp)) {
                                msg = this._errorMsg('invalid timestamp diff (lower than period)');
                                throw new Error(msg);
                            }
                        }
                        if (this._common.consensusType() === 'pow') {
                            if (!this.validateDifficulty(parentHeader)) {
                                msg = this._errorMsg('invalid difficulty');
                                throw new Error(msg);
                            }
                        }
                        if (!this.validateGasLimit(parentHeader)) {
                            msg = this._errorMsg('invalid gas limit');
                            throw new Error(msg);
                        }
                        if (height) {
                            dif = height.sub(parentHeader.number);
                            if (!(dif.ltn(8) && dif.gtn(1))) {
                                msg = this._errorMsg('uncle block has a parent that is too old or too young');
                                throw new Error(msg);
                            }
                        }
                        // check if the block used too much gas
                        if (this.gasUsed.gt(this.gasLimit)) {
                            msg = this._errorMsg('Invalid block: too much gas used');
                            throw new Error(msg);
                        }
                        if (this._common.isActivatedEIP(1559)) {
                            if (!this.baseFeePerGas) {
                                msg = this._errorMsg('EIP1559 block has no base fee field');
                                throw new Error(msg);
                            }
                            block = this._common.hardforkBlockBN('london');
                            isInitialEIP1559Block = block && this.number.eq(block);
                            if (isInitialEIP1559Block) {
                                initialBaseFee = new ethereumjs_util_1.BN(this._common.param('gasConfig', 'initialBaseFee'));
                                if (!this.baseFeePerGas.eq(initialBaseFee)) {
                                    msg = this._errorMsg('Initial EIP1559 block does not have initial base fee');
                                    throw new Error(msg);
                                }
                            }
                            else {
                                expectedBaseFee = parentHeader.calcNextBaseFee();
                                if (!this.baseFeePerGas.eq(expectedBaseFee)) {
                                    msg = this._errorMsg('Invalid block: base fee not correct');
                                    throw new Error(msg);
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculates the base fee for a potential next block
     */
    BlockHeader.prototype.calcNextBaseFee = function () {
        if (!this._common.isActivatedEIP(1559)) {
            var msg = this._errorMsg('calcNextBaseFee() can only be called with EIP1559 being activated');
            throw new Error(msg);
        }
        var nextBaseFee;
        var elasticity = new ethereumjs_util_1.BN(this._common.param('gasConfig', 'elasticityMultiplier'));
        var parentGasTarget = this.gasLimit.div(elasticity);
        if (parentGasTarget.eq(this.gasUsed)) {
            nextBaseFee = this.baseFeePerGas;
        }
        else if (this.gasUsed.gt(parentGasTarget)) {
            var gasUsedDelta = this.gasUsed.sub(parentGasTarget);
            var baseFeeMaxChangeDenominator = new ethereumjs_util_1.BN(this._common.param('gasConfig', 'baseFeeMaxChangeDenominator'));
            var calculatedDelta = this.baseFeePerGas.mul(gasUsedDelta)
                .div(parentGasTarget)
                .div(baseFeeMaxChangeDenominator);
            nextBaseFee = ethereumjs_util_1.BN.max(calculatedDelta, new ethereumjs_util_1.BN(1)).add(this.baseFeePerGas);
        }
        else {
            var gasUsedDelta = parentGasTarget.sub(this.gasUsed);
            var baseFeeMaxChangeDenominator = new ethereumjs_util_1.BN(this._common.param('gasConfig', 'baseFeeMaxChangeDenominator'));
            var calculatedDelta = this.baseFeePerGas.mul(gasUsedDelta)
                .div(parentGasTarget)
                .div(baseFeeMaxChangeDenominator);
            nextBaseFee = ethereumjs_util_1.BN.max(this.baseFeePerGas.sub(calculatedDelta), new ethereumjs_util_1.BN(0));
        }
        return nextBaseFee;
    };
    /**
     * Returns a Buffer Array of the raw Buffers in this header, in order.
     */
    BlockHeader.prototype.raw = function () {
        var rawItems = [
            this.parentHash,
            this.uncleHash,
            this.coinbase.buf,
            this.stateRoot,
            this.transactionsTrie,
            this.receiptTrie,
            this.logsBloom,
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.difficulty),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.number),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.gasLimit),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.gasUsed),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.timestamp),
            this.extraData,
            this.mixHash,
            this.nonce,
        ];
        if (this._common.isActivatedEIP(1559)) {
            rawItems.push((0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.baseFeePerGas));
        }
        return rawItems;
    };
    /**
     * Returns the hash of the block header.
     */
    BlockHeader.prototype.hash = function () {
        if (Object.isFrozen(this)) {
            if (!this.cache.hash) {
                this.cache.hash = (0, ethereumjs_util_1.rlphash)(this.raw());
            }
            return this.cache.hash;
        }
        return (0, ethereumjs_util_1.rlphash)(this.raw());
    };
    /**
     * Checks if the block header is a genesis header.
     */
    BlockHeader.prototype.isGenesis = function () {
        return this.number.isZero();
    };
    BlockHeader.prototype._requireClique = function (name) {
        if (this._common.consensusAlgorithm() !== common_1.ConsensusAlgorithm.Clique) {
            var msg = this._errorMsg("BlockHeader." + name + "() call only supported for clique PoA networks");
            throw new Error(msg);
        }
    };
    /**
     * PoA clique signature hash without the seal.
     */
    BlockHeader.prototype.cliqueSigHash = function () {
        this._requireClique('cliqueSigHash');
        var raw = this.raw();
        raw[12] = this.extraData.slice(0, this.extraData.length - clique_1.CLIQUE_EXTRA_SEAL);
        return (0, ethereumjs_util_1.rlphash)(raw);
    };
    /**
     * Checks if the block header is an epoch transition
     * header (only clique PoA, throws otherwise)
     */
    BlockHeader.prototype.cliqueIsEpochTransition = function () {
        this._requireClique('cliqueIsEpochTransition');
        var epoch = new ethereumjs_util_1.BN(this._common.consensusConfig().epoch);
        // Epoch transition block if the block number has no
        // remainder on the division by the epoch length
        return this.number.mod(epoch).isZero();
    };
    /**
     * Returns extra vanity data
     * (only clique PoA, throws otherwise)
     */
    BlockHeader.prototype.cliqueExtraVanity = function () {
        this._requireClique('cliqueExtraVanity');
        return this.extraData.slice(0, clique_1.CLIQUE_EXTRA_VANITY);
    };
    /**
     * Returns extra seal data
     * (only clique PoA, throws otherwise)
     */
    BlockHeader.prototype.cliqueExtraSeal = function () {
        this._requireClique('cliqueExtraSeal');
        return this.extraData.slice(-clique_1.CLIQUE_EXTRA_SEAL);
    };
    /**
     * Seal block with the provided signer.
     * Returns the final extraData field to be assigned to `this.extraData`.
     * @hidden
     */
    BlockHeader.prototype.cliqueSealBlock = function (privateKey) {
        this._requireClique('cliqueSealBlock');
        var signature = (0, ethereumjs_util_1.ecsign)(this.cliqueSigHash(), privateKey);
        var signatureB = Buffer.concat([signature.r, signature.s, (0, ethereumjs_util_1.intToBuffer)(signature.v - 27)]);
        var extraDataWithoutSeal = this.extraData.slice(0, this.extraData.length - clique_1.CLIQUE_EXTRA_SEAL);
        var extraData = Buffer.concat([extraDataWithoutSeal, signatureB]);
        return extraData;
    };
    /**
     * Returns a list of signers
     * (only clique PoA, throws otherwise)
     *
     * This function throws if not called on an epoch
     * transition block and should therefore be used
     * in conjunction with {@link BlockHeader.cliqueIsEpochTransition}
     */
    BlockHeader.prototype.cliqueEpochTransitionSigners = function () {
        this._requireClique('cliqueEpochTransitionSigners');
        if (!this.cliqueIsEpochTransition()) {
            var msg = this._errorMsg('Signers are only included in epoch transition blocks (clique)');
            throw new Error(msg);
        }
        var start = clique_1.CLIQUE_EXTRA_VANITY;
        var end = this.extraData.length - clique_1.CLIQUE_EXTRA_SEAL;
        var signerBuffer = this.extraData.slice(start, end);
        var signerList = [];
        var signerLength = 20;
        for (var start_1 = 0; start_1 <= signerBuffer.length - signerLength; start_1 += signerLength) {
            signerList.push(signerBuffer.slice(start_1, start_1 + signerLength));
        }
        return signerList.map(function (buf) { return new ethereumjs_util_1.Address(buf); });
    };
    /**
     * Verifies the signature of the block (last 65 bytes of extraData field)
     * (only clique PoA, throws otherwise)
     *
     *  Method throws if signature is invalid
     */
    BlockHeader.prototype.cliqueVerifySignature = function (signerList) {
        this._requireClique('cliqueVerifySignature');
        var signerAddress = this.cliqueSigner();
        var signerFound = signerList.find(function (signer) {
            return signer.equals(signerAddress);
        });
        return !!signerFound;
    };
    /**
     * Returns the signer address
     */
    BlockHeader.prototype.cliqueSigner = function () {
        this._requireClique('cliqueSigner');
        var extraSeal = this.cliqueExtraSeal();
        // Reasonable default for default blocks
        if (extraSeal.length === 0) {
            return ethereumjs_util_1.Address.zero();
        }
        var r = extraSeal.slice(0, 32);
        var s = extraSeal.slice(32, 64);
        var v = new ethereumjs_util_1.BN(extraSeal.slice(64, 65)).addn(27);
        var pubKey = (0, ethereumjs_util_1.ecrecover)(this.cliqueSigHash(), v, r, s);
        return ethereumjs_util_1.Address.fromPublicKey(pubKey);
    };
    /**
     * Returns the rlp encoding of the block header.
     */
    BlockHeader.prototype.serialize = function () {
        return ethereumjs_util_1.rlp.encode(this.raw());
    };
    /**
     * Returns the block header in JSON format.
     */
    BlockHeader.prototype.toJSON = function () {
        var jsonDict = {
            parentHash: '0x' + this.parentHash.toString('hex'),
            uncleHash: '0x' + this.uncleHash.toString('hex'),
            coinbase: this.coinbase.toString(),
            stateRoot: '0x' + this.stateRoot.toString('hex'),
            transactionsTrie: '0x' + this.transactionsTrie.toString('hex'),
            receiptTrie: '0x' + this.receiptTrie.toString('hex'),
            logsBloom: '0x' + this.logsBloom.toString('hex'),
            difficulty: (0, ethereumjs_util_1.bnToHex)(this.difficulty),
            number: (0, ethereumjs_util_1.bnToHex)(this.number),
            gasLimit: (0, ethereumjs_util_1.bnToHex)(this.gasLimit),
            gasUsed: (0, ethereumjs_util_1.bnToHex)(this.gasUsed),
            timestamp: (0, ethereumjs_util_1.bnToHex)(this.timestamp),
            extraData: '0x' + this.extraData.toString('hex'),
            mixHash: '0x' + this.mixHash.toString('hex'),
            nonce: '0x' + this.nonce.toString('hex'),
        };
        if (this._common.isActivatedEIP(1559)) {
            jsonDict.baseFeePerGas = '0x' + this.baseFeePerGas.toString('hex');
            jsonDict.baseFee = '0x' + this.baseFeePerGas.toString('hex'); // deprecated alias, please use `baseFeePerGas`, will be removed in next major release
        }
        jsonDict.bloom = jsonDict.logsBloom; // deprecated alias, please use `logsBloom`, will be removed in next major release
        return jsonDict;
    };
    BlockHeader.prototype._getHardfork = function () {
        return this._common.hardfork() || this._common.activeHardfork(this.number.toNumber());
    };
    BlockHeader.prototype._getHeaderByHash = function (blockchain, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var header, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, blockchain.getBlock(hash)];
                    case 1:
                        header = (_a.sent()).header;
                        return [2 /*return*/, header];
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
     * Validates extra data is DAO_ExtraData for DAO_ForceExtraDataRange blocks after DAO
     * activation block (see: https://blog.slock.it/hard-fork-specification-24b889e70703)
     */
    BlockHeader.prototype._validateDAOExtraData = function () {
        if (!this._common.hardforkIsActiveOnChain(common_1.Hardfork.Dao)) {
            return;
        }
        var DAOActivationBlock = this._common.hardforkBlockBN(common_1.Hardfork.Dao);
        if (!DAOActivationBlock || DAOActivationBlock.isZero() || this.number.lt(DAOActivationBlock)) {
            return;
        }
        var DAO_ExtraData = Buffer.from('64616f2d686172642d666f726b', 'hex');
        var DAO_ForceExtraDataRange = new ethereumjs_util_1.BN(9);
        var drift = this.number.sub(DAOActivationBlock);
        if (drift.lte(DAO_ForceExtraDataRange) && !this.extraData.equals(DAO_ExtraData)) {
            var msg = this._errorMsg("extraData should be 'dao-hard-fork'");
            throw new Error(msg);
        }
    };
    /**
     * Return a compact error string representation of the object
     */
    BlockHeader.prototype.errorStr = function () {
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
        var errorStr = "block header number=" + this.number + " hash=" + hash + " ";
        errorStr += "hf=" + hf + " baseFeePerGas=" + ((_a = this.baseFeePerGas) !== null && _a !== void 0 ? _a : 'none');
        return errorStr;
    };
    /**
     * Internal helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    BlockHeader.prototype._errorMsg = function (msg) {
        return msg + " (" + this.errorStr() + ")";
    };
    return BlockHeader;
}());
exports.BlockHeader = BlockHeader;
//# sourceMappingURL=header.js.map