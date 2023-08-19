"use strict";
/**
 * @protected
 *
 * @packageDocumentation
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readStorage = exports.readSlot = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:storage:read");
const Conversion = __importStar(require("../../conversion"));
const Utils = __importStar(require("../utils"));
const Evm = __importStar(require("../../evm"));
const errors_1 = require("../../errors");
function* readSlot(storage, slot) {
    const address = Utils.slotAddress(slot);
    // debug("reading slot: %o", Conversion.toHexString(address));
    const hexAddress = Conversion.toHexString(address, Evm.Utils.WORD_SIZE);
    let word = storage[hexAddress];
    //if we can't find the word in the map, we place a request to the invoker to supply it
    //(contract-decoder will look it up from the blockchain, while the debugger will just
    //say 0)
    if (word === undefined) {
        word = yield {
            type: "storage",
            slot: address
        };
    }
    return word;
}
exports.readSlot = readSlot;
function* readStorage(pointer, state) {
    const { storage } = state;
    const { range } = pointer;
    debug("readRange %o", range);
    let { from, to, length } = range;
    from = {
        slot: from.slot,
        index: from.index || 0
    };
    if (length !== undefined) {
        to = {
            slot: {
                path: from.slot.path || undefined,
                offset: from.slot.offset.addn(Math.floor((from.index + length - 1) / Evm.Utils.WORD_SIZE))
            },
            index: (from.index + length - 1) % Evm.Utils.WORD_SIZE
        };
    }
    debug("normalized readRange %o", { from, to });
    let totalWordsAsBN = to.slot.offset.sub(from.slot.offset).addn(1);
    let totalWords;
    try {
        totalWords = totalWordsAsBN.toNumber();
    }
    catch (_) {
        throw new errors_1.DecodingError({
            kind: "ReadErrorStorage",
            range
        });
    }
    let data = new Uint8Array(totalWords * Evm.Utils.WORD_SIZE);
    for (let i = 0; i < totalWords; i++) {
        let offset = from.slot.offset.addn(i);
        const word = yield* readSlot(storage, Object.assign(Object.assign({}, from.slot), { offset }));
        if (typeof word !== "undefined") {
            data.set(word, i * Evm.Utils.WORD_SIZE);
        }
    }
    debug("words %o", data);
    data = data.slice(from.index, (totalWords - 1) * Evm.Utils.WORD_SIZE + to.index + 1);
    debug("data: %o", data);
    return data;
}
exports.readStorage = readStorage;
//# sourceMappingURL=index.js.map