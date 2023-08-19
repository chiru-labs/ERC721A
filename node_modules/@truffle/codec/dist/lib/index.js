"use strict";
/**
 * # Truffle Codec
 *
 * This module provides low-level decoding and encoding functionality for
 * Solidity and the Solidity ABI.  Many parts of this module are intended
 * primarily for internal use by Truffle and so remain largely undocumented,
 * but some of its types are also output by @truffle/decoder, which provides
 * a higher-level interface to much of this module's functionality.
 *
 * ## If you're here from Truffle Decoder
 *
 * If you're coming here from [[@truffle/decoder]], you probably just want to
 * know about the parts that are relevant to you.  These are:
 *
 * * The "data" category (specifically [[Format]])
 * * The "output" and "enumerations" categories ([[CalldataDecoding]], [[LogDecoding]], et al., see below)
 * * The "errors" category (specifically [[UnknownUserDefinedTypeError]])
 *
 * Note that the data category is largely scarce in
 * documentation, although that's because it's largely self-explanatory.
 *
 * If you're not just here from Truffle Decoder, but are actually
 * interested in the lower-level workings, read on.
 *
 * ## How this module differs from Truffle Decoder
 *
 * Unlike Truffle Decoder, this library makes no network connections
 * and avoids dependencies that do.  Instead, its decoding functionality
 * is generator-based; calling one of the decoding functions returns a
 * generator.  This generator's `next()` function may return a finished
 * result, or it may return a request for more information.  It is up to
 * the caller to fulfill these requests -- say, by making a network
 * connection of its own.  This is how @truffle/decoder works; @truffle/codec
 * makes requests, and @truffle/decoder fulfills them by
 * looking up the necessary information on the blockchain.
 *
 * This library also provides additional functionality beyond what's used by
 * Truffle Decoder.  In particular, this library also exists to support Truffle
 * Debugger, and so it provides encoding functionality not just for
 * transactions, logs, and state variables, but also for Solidity variables
 * during transaction execution, including circularity detection for memroy
 * structures.  It includes functionality for decoding Solidity's internal
 * function pointers, which the debugger uses, but which Truffle Decoder
 * currently does not (although this is planned for the future).
 *
 * There is also functionality for decoding return values and revert messages
 * that goes beyond what's currently available in @truffle/decoder; this may get
 * a better interface in the future.
 *
 * ## How to use
 *
 * You should probably use [[@truffle/decoder]] instead, if your use case doesn't
 * preclude it.  This module has little documentation, where it has any at all,
 * and it's likely that parts of its interface may change (particularly
 * regarding allocation).  That said, if you truly need the functionality here,
 * Truffle Decoder can perhaps serve as something of a reference implementation
 * (and perhaps Truffle Debugger as well, though that code is much harder to
 * read or copy).
 *
 * @module @truffle/codec
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Export = exports.Evm = exports.Conversion = exports.Contexts = exports.Compilations = exports.Compiler = exports.Ast = exports.AstConstant = exports.Storage = exports.Stack = exports.Special = exports.Memory = exports.MappingKey = exports.Topic = exports.AbiData = exports.Bytes = exports.Basic = exports.abifyReturndataDecoding = exports.abifyLogDecoding = exports.abifyCalldataDecoding = exports.StopDecodingError = exports.DecodingError = exports.decodeRevert = exports.decodeReturndata = exports.decodeCalldata = exports.decodeEvent = exports.decodeVariable = exports.Format = void 0;
//So, what shall codec export...?
//First: export the data format
const Format = __importStar(require("./format"));
exports.Format = Format;
//now... various low-level stuff we want to export!
//the actual decoding functions and related errors
var core_1 = require("./core");
Object.defineProperty(exports, "decodeVariable", { enumerable: true, get: function () { return core_1.decodeVariable; } });
Object.defineProperty(exports, "decodeEvent", { enumerable: true, get: function () { return core_1.decodeEvent; } });
Object.defineProperty(exports, "decodeCalldata", { enumerable: true, get: function () { return core_1.decodeCalldata; } });
Object.defineProperty(exports, "decodeReturndata", { enumerable: true, get: function () { return core_1.decodeReturndata; } });
Object.defineProperty(exports, "decodeRevert", { enumerable: true, get: function () { return core_1.decodeRevert; } });
var errors_1 = require("./errors");
Object.defineProperty(exports, "DecodingError", { enumerable: true, get: function () { return errors_1.DecodingError; } });
Object.defineProperty(exports, "StopDecodingError", { enumerable: true, get: function () { return errors_1.StopDecodingError; } });
__exportStar(require("./common"), exports);
var abify_1 = require("./abify");
Object.defineProperty(exports, "abifyCalldataDecoding", { enumerable: true, get: function () { return abify_1.abifyCalldataDecoding; } });
Object.defineProperty(exports, "abifyLogDecoding", { enumerable: true, get: function () { return abify_1.abifyLogDecoding; } });
Object.defineProperty(exports, "abifyReturndataDecoding", { enumerable: true, get: function () { return abify_1.abifyReturndataDecoding; } });
// data locations - common
const Basic = __importStar(require("./basic"));
exports.Basic = Basic;
const Bytes = __importStar(require("./bytes"));
exports.Bytes = Bytes;
// data locations - abi
const AbiData = __importStar(require("./abi-data"));
exports.AbiData = AbiData;
const Topic = __importStar(require("./topic"));
exports.Topic = Topic;
// data locations - solidity
const MappingKey = __importStar(require("./mapping-key"));
exports.MappingKey = MappingKey;
const Memory = __importStar(require("./memory"));
exports.Memory = Memory;
const Special = __importStar(require("./special"));
exports.Special = Special;
const Stack = __importStar(require("./stack"));
exports.Stack = Stack;
const Storage = __importStar(require("./storage"));
exports.Storage = Storage;
const AstConstant = __importStar(require("./ast-constant"));
exports.AstConstant = AstConstant;
const Ast = __importStar(require("./ast"));
exports.Ast = Ast;
const Compiler = __importStar(require("./compiler"));
exports.Compiler = Compiler;
const Compilations = __importStar(require("./compilations"));
exports.Compilations = Compilations;
const Contexts = __importStar(require("./contexts"));
exports.Contexts = Contexts;
const Conversion = __importStar(require("./conversion"));
exports.Conversion = Conversion;
const Evm = __importStar(require("./evm"));
exports.Evm = Evm;
const Export = __importStar(require("./export"));
exports.Export = Export;
//# sourceMappingURL=index.js.map