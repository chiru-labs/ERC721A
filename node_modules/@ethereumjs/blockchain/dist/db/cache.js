"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lru_cache_1 = __importDefault(require("lru-cache"));
/**
 * Simple LRU Cache that allows for keys of type Buffer
 * @hidden
 */
class Cache {
    constructor(opts) {
        this._cache = new lru_cache_1.default(opts);
    }
    set(key, value) {
        if (key instanceof Buffer) {
            key = key.toString('hex');
        }
        this._cache.set(key, value);
    }
    get(key) {
        if (key instanceof Buffer) {
            key = key.toString('hex');
        }
        return this._cache.get(key);
    }
    del(key) {
        if (key instanceof Buffer) {
            key = key.toString('hex');
        }
        this._cache.del(key);
    }
}
exports.default = Cache;
//# sourceMappingURL=cache.js.map