"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var rlp = require("rlp");
var cache_1 = require("./cache");
var util_1 = require("./util");
var BN = require("bn.js");
var level = require('level-mem');
var Block = require('ethereumjs-block');
/**
 * Abstraction over a DB to facilitate storing/fetching blockchain-related
 * data, such as blocks and headers, indices, and the head block.
 * @hidden
 */
var DBManager = /** @class */ (function () {
    function DBManager(db, common) {
        this._db = db;
        this._common = common;
        this._cache = {
            td: new cache_1.default({ max: 1024 }),
            header: new cache_1.default({ max: 512 }),
            body: new cache_1.default({ max: 256 }),
            numberToHash: new cache_1.default({ max: 2048 }),
            hashToNumber: new cache_1.default({ max: 2048 }),
        };
    }
    /**
     * Fetches iterator heads from the db.
     */
    DBManager.prototype.getHeads = function () {
        return this.get(util_1.headsKey, { valueEncoding: 'json' });
    };
    /**
     * Fetches header of the head block.
     */
    DBManager.prototype.getHeadHeader = function () {
        return this.get(util_1.headHeaderKey);
    };
    /**
     * Fetches head block.
     */
    DBManager.prototype.getHeadBlock = function () {
        return this.get(util_1.headBlockKey);
    };
    /**
     * Fetches a block (header and body), given a block tag
     * which can be either its hash or its number.
     */
    DBManager.prototype.getBlock = function (blockTag) {
        return __awaiter(this, void 0, void 0, function () {
            var number, hash, header, body, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // determine BlockTag type
                        if (typeof blockTag === 'number' && Number.isInteger(blockTag)) {
                            blockTag = new BN(blockTag);
                        }
                        if (!Buffer.isBuffer(blockTag)) return [3 /*break*/, 2];
                        hash = blockTag;
                        return [4 /*yield*/, this.hashToNumber(blockTag)];
                    case 1:
                        number = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!BN.isBN(blockTag)) return [3 /*break*/, 4];
                        number = blockTag;
                        return [4 /*yield*/, this.numberToHash(blockTag)];
                    case 3:
                        hash = _a.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new Error('Unknown blockTag type');
                    case 5: return [4 /*yield*/, this.getHeader(hash, number)];
                    case 6:
                        header = (_a.sent()).raw;
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, this.getBody(hash, number)];
                    case 8:
                        body = _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        e_1 = _a.sent();
                        body = [[], []];
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, new Block([header].concat(body), { common: this._common })];
                }
            });
        });
    };
    /**
     * Fetches body of a block given its hash and number.
     */
    DBManager.prototype.getBody = function (hash, number) {
        return __awaiter(this, void 0, void 0, function () {
            var key, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        key = util_1.bodyKey(number, hash);
                        _b = (_a = rlp).decode;
                        return [4 /*yield*/, this.get(key, { cache: 'body' })];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
     * Fetches header of a block given its hash and number.
     */
    DBManager.prototype.getHeader = function (hash, number) {
        return __awaiter(this, void 0, void 0, function () {
            var key, encodedHeader;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = util_1.headerKey(number, hash);
                        return [4 /*yield*/, this.get(key, { cache: 'header' })];
                    case 1:
                        encodedHeader = _a.sent();
                        return [2 /*return*/, new Block.Header(rlp.decode(encodedHeader), {
                                common: this._common,
                            })];
                }
            });
        });
    };
    /**
     * Fetches total difficulty for a block given its hash and number.
     */
    DBManager.prototype.getTd = function (hash, number) {
        return __awaiter(this, void 0, void 0, function () {
            var key, td;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = util_1.tdKey(number, hash);
                        return [4 /*yield*/, this.get(key, { cache: 'td' })];
                    case 1:
                        td = _a.sent();
                        return [2 /*return*/, new BN(rlp.decode(td))];
                }
            });
        });
    };
    /**
     * Performs a block hash to block number lookup.
     */
    DBManager.prototype.hashToNumber = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var key, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = util_1.hashToNumberKey(hash);
                        _a = BN.bind;
                        return [4 /*yield*/, this.get(key, { cache: 'hashToNumber' })];
                    case 1: return [2 /*return*/, new (_a.apply(BN, [void 0, _b.sent()]))()];
                }
            });
        });
    };
    /**
     * Performs a block number to block hash lookup.
     */
    DBManager.prototype.numberToHash = function (number) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                if (number.ltn(0)) {
                    throw new level.errors.NotFoundError();
                }
                key = util_1.numberToHashKey(number);
                return [2 /*return*/, this.get(key, { cache: 'numberToHash' })];
            });
        });
    };
    /**
     * Fetches a key from the db. If `opts.cache` is specified
     * it first tries to load from cache, and on cache miss will
     * try to put the fetched item on cache afterwards.
     */
    DBManager.prototype.get = function (key, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var dbOpts, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbOpts = {
                            keyEncoding: opts.keyEncoding || 'binary',
                            valueEncoding: opts.valueEncoding || 'binary',
                        };
                        if (!opts.cache) return [3 /*break*/, 3];
                        if (!this._cache[opts.cache]) {
                            throw new Error("Invalid cache: " + opts.cache);
                        }
                        value = this._cache[opts.cache].get(key);
                        if (!!value) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._db.get(key, dbOpts)];
                    case 1:
                        value = (_a.sent());
                        this._cache[opts.cache].set(key, value);
                        _a.label = 2;
                    case 2: return [2 /*return*/, value];
                    case 3: return [2 /*return*/, this._db.get(key, dbOpts)];
                }
            });
        });
    };
    /**
     * Performs a batch operation on db.
     */
    DBManager.prototype.batch = function (ops) {
        return this._db.batch(ops);
    };
    return DBManager;
}());
exports.default = DBManager;
//# sourceMappingURL=dbManager.js.map