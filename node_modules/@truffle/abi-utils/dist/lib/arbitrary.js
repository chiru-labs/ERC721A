"use strict";
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
exports.Abi = exports.ConstructorEntry = exports.FallbackEntry = exports.ReceiveEntry = exports.FunctionEntry = exports.ErrorEntry = exports.EventEntry = exports.EventParameter = exports.Parameter = void 0;
const fc = __importStar(require("fast-check"));
const faker_1 = __importDefault(require("faker"));
const change_case_1 = require("change-case");
const Parameter = () => fc
    .tuple(fc.record({
    name: ParameterName()
}), TypeRecord())
    .map(([{ name }, type]) => (Object.assign({ name }, type)));
exports.Parameter = Parameter;
const EventParameter = () => fc
    .tuple(fc.record({
    name: ParameterName(),
    indexed: fc.boolean()
}), TypeRecord())
    .map(([{ name, indexed }, type]) => (Object.assign({ name, indexed }, type)));
exports.EventParameter = EventParameter;
const EventEntry = () => fc.record({
    type: fc.constant("event"),
    name: EventName(),
    inputs: fc.array(exports.EventParameter(), { maxLength: 10 }).filter(inputs => {
        if (inputs.filter(({ indexed }) => indexed).length > 3) {
            // only up to 3 params can be indexed
            return false;
        }
        // names that are not blank should be unique
        const names = inputs.map(({ name }) => name).filter(name => name !== "");
        return names.length === new Set(names).size;
    }),
    anonymous: fc.boolean()
});
exports.EventEntry = EventEntry;
const ErrorEntry = () => fc.record({
    type: fc.constant("error"),
    name: ErrorName(),
    inputs: fc.array(exports.Parameter(), { maxLength: 10 }).filter(inputs => {
        // names that are not blank should be unique
        const names = inputs.map(({ name }) => name).filter(name => name !== "");
        return names.length === new Set(names).size;
    })
});
exports.ErrorEntry = ErrorEntry;
const FunctionEntry = () => fc
    .tuple(fc.record({
    type: fc.constant("function")
}, { withDeletedKeys: true }), fc.record({
    name: FunctionName(),
    inputs: fc.array(exports.Parameter(), { maxLength: 10 })
}), fc.record({
    outputs: fc.array(exports.Parameter(), { maxLength: 10 })
}, { withDeletedKeys: true }), fc
    .tuple(fc.oneof(fc.constant("pure"), fc.constant("view"), fc.constant("nonpayable"), fc.constant("payable")), fc.boolean(), fc.boolean())
    .map(([stateMutability, includeLegacy, includeModern]) => {
    const payable = stateMutability === "payable";
    const constant = stateMutability === "view" || stateMutability === "pure";
    const modern = { stateMutability };
    const legacy = { payable, constant };
    return includeLegacy && includeModern
        ? Object.assign(Object.assign({}, modern), legacy) : includeModern
        ? modern
        : legacy;
}))
    .map(records => records.reduce((a, b) => (Object.assign(Object.assign({}, a), b)), {}))
    .filter(entry => {
    const { inputs, outputs = [] } = entry;
    // names that are not blank should be unique
    const names = [...inputs, ...outputs]
        .map(({ name }) => name)
        .filter(name => name !== "");
    return names.length === new Set(names).size;
});
exports.FunctionEntry = FunctionEntry;
const ReceiveEntry = () => fc.record({
    type: fc.constant("receive"),
    stateMutability: fc.constant("payable")
});
exports.ReceiveEntry = ReceiveEntry;
const FallbackEntry = () => fc
    .tuple(fc.record({
    type: fc.constant("fallback")
}), fc
    .tuple(fc.oneof(fc.constant("nonpayable"), fc.constant("payable")), fc.boolean(), fc.boolean())
    .map(([stateMutability, includeLegacy, includeModern]) => {
    const payable = stateMutability === "payable";
    const modern = { stateMutability };
    const legacy = { payable };
    return includeLegacy && includeModern
        ? Object.assign(Object.assign({}, modern), legacy) : includeModern
        ? modern
        : legacy;
}))
    .map(([{ type }, mutabilityFields]) => (Object.assign({ type }, mutabilityFields)));
exports.FallbackEntry = FallbackEntry;
const ConstructorEntry = () => fc
    .tuple(fc.record({
    type: fc.constant("constructor"),
    inputs: fc.array(exports.Parameter(), { maxLength: 10 }).filter(inputs => {
        // names that are not blank should be unique
        const names = inputs.map(({ name }) => name).filter(name => name !== "");
        return names.length === new Set(names).size;
    })
}), fc
    .tuple(fc.oneof(fc.constant("nonpayable"), fc.constant("payable")), fc.boolean(), fc.boolean())
    .map(([stateMutability, includeLegacy, includeModern]) => {
    const payable = stateMutability === "payable";
    const modern = { stateMutability };
    const legacy = { payable };
    return includeLegacy && includeModern
        ? Object.assign(Object.assign({}, modern), legacy) : includeModern
        ? modern
        : legacy;
}))
    .map(([{ type, inputs }, mutabilityFields]) => (Object.assign({ type,
    inputs }, mutabilityFields)));
exports.ConstructorEntry = ConstructorEntry;
const Abi = () => fc
    .tuple(exports.ConstructorEntry(), exports.FallbackEntry(), exports.ReceiveEntry(), fc.array(fc.oneof(exports.FunctionEntry(), exports.EventEntry(), exports.ErrorEntry())))
    .chain(([constructor, fallback, receive, entries]) => fc.shuffledSubarray([constructor, fallback, receive, ...entries]));
exports.Abi = Abi;
var Numerics;
(function (Numerics) {
    // 0 < n <= 32
    // use subtraction so that fast-check treats 32 as simpler than 1
    Numerics.Bytes = () => fc.nat(31).map(k => 32 - k);
    // 0 < n <= 256, 8 | n
    Numerics.Bits = () => Numerics.Bytes().map(k => 8 * k);
    // 0 < n <= 80
    // use fancy math so that fast-check treats 18 as the simplest case
    //
    //     0 ----------------- 79
    //     lines up as:
    //     18 ------ 80, 0 --- 17
    Numerics.DecimalPlaces = () => fc.nat(79).map(k => ((k + 17) % 80) + 1);
    Numerics.Precision = () => fc.tuple(Numerics.Bits(), Numerics.DecimalPlaces());
})(Numerics || (Numerics = {}));
var Primitives;
(function (Primitives) {
    Primitives.Uint = () => Numerics.Bits().map(m => `uint${m}`);
    Primitives.Int = () => Numerics.Bits().map(m => `int${m}`);
    Primitives.Address = () => fc.constant("address");
    Primitives.Bool = () => fc.constant("bool");
    Primitives.Fixed = () => Numerics.Precision().map(([m, n]) => `fixed${m}x${n}`);
    Primitives.Ufixed = () => Numerics.Precision().map(([m, n]) => `ufixed${m}x${n}`);
    Primitives.BytesM = () => Numerics.Bytes().map(m => `bytes${m}`);
    Primitives.Function = () => fc.constant("function");
    Primitives.Bytes = () => fc.constant("bytes");
    Primitives.String = () => fc.constant("string");
    Primitives.Tuple = () => fc.constant("tuple");
})(Primitives || (Primitives = {}));
const Primitive = () => fc.oneof(Primitives.Uint(), Primitives.Int(), Primitives.Address(), Primitives.Bool(), Primitives.Fixed(), Primitives.Ufixed(), Primitives.BytesM(), Primitives.Function(), Primitives.Bytes(), Primitives.String(), Primitives.Tuple());
const Type = fc.memo(n => n === 0
    ? Primitive()
    : // we cap this at 3 so that fast-check doesn't blow the stack
        fc.oneof(Primitive(), ArrayFixed(n > 3 ? 3 : n), ArrayDynamic(n)));
const ArrayFixed = fc.memo(n => fc
    .tuple(Type(n - 1), fc.integer(1, 256))
    .map(([type, length]) => `${type}[${length}]`));
const ArrayDynamic = fc.memo(n => Type(n - 1).map(type => `${type}[]`));
const reservedWords = new Set([
    "Error",
    "Panic",
    "_",
    "abi",
    "abstract",
    "addmod",
    "address",
    "after",
    "alias",
    "anonymous",
    "apply",
    "as",
    "assembly",
    "assert",
    "auto",
    "block",
    "blockhash",
    "bool",
    "break",
    "byte",
    "bytes",
    "calldata",
    "case",
    "catch",
    "constant",
    "constructor",
    "continue",
    "contract",
    "copyof",
    "days",
    "default",
    "define",
    "delete",
    "ecrecover",
    "else",
    "emit",
    "enum",
    "error",
    "ether",
    "event",
    "external",
    "fallback",
    "false",
    "final",
    "finney",
    "fixed",
    "for",
    "from",
    "function",
    "gasleft",
    "gwei",
    "hours",
    "if",
    "immutable",
    "implements",
    "import",
    "in",
    "indexed",
    "inline",
    "int",
    "interface",
    "internal",
    "is",
    "keccak256",
    "let",
    "library",
    "log0",
    "log1",
    "log2",
    "log3",
    "log4",
    "macro",
    "mapping",
    "match",
    "memory",
    "minutes",
    "modifier",
    "msg",
    "mulmod",
    "mutable",
    "new",
    "now",
    "null",
    "of",
    "override",
    "partial",
    "payable",
    "pragma",
    "private",
    "promise",
    "public",
    "pure",
    "receive",
    "reference",
    "relocatable",
    "require",
    "return",
    "returns",
    "revert",
    "ripemd160",
    "sealed",
    "seconds",
    "selfdestruct",
    "sha256",
    "sha3",
    "sizeof",
    "static",
    "storage",
    "string",
    "struct",
    "suicide",
    "super",
    "supports",
    "switch",
    "szabo",
    "this",
    "throw",
    "true",
    "try",
    "tx",
    "type",
    "typedef",
    "typeof",
    "ufixed",
    "uint",
    "unchecked",
    "using",
    "var",
    "view",
    "virtual",
    "weeks",
    "wei",
    "while",
    "years"
]);
// borrowed from https://runkit.com/dubzzz/faker-to-fast-check
const fakerToArb = (template, transform = change_case_1.camelCase) => {
    return fc
        .integer()
        .noBias()
        .noShrink()
        .map(seed => {
        faker_1.default.seed(seed);
        return transform(faker_1.default.fake(template));
    })
        .filter(word => !reservedWords.has(word));
};
const ParameterName = () => fc.frequency({ arbitrary: fakerToArb("{{hacker.noun}}"), weight: 9 }, { arbitrary: fc.constant(""), weight: 1 });
const EventName = () => fakerToArb("{{hacker.verb}} {{hacker.noun}}", change_case_1.pascalCase);
const ErrorName = () => fakerToArb("{{hacker.noun}} {{hacker.noun}}", change_case_1.pascalCase);
const FunctionName = () => fakerToArb("{{hacker.verb}} {{hacker.noun}}");
const TypeRecord = () => Type().chain(type => type.startsWith("tuple")
    ? fc.record({
        type: fc.constant(type),
        components: fc
            .array(exports.Parameter().filter(({ name }) => name !== ""), { minLength: 1, maxLength: 5 })
            .filter(items => {
            const names = items
                .map(({ name }) => name)
                .filter(name => name !== "");
            return names.length === new Set(names).size;
        })
    })
    : fc.record({
        type: fc.constant(type)
    }));
//# sourceMappingURL=arbitrary.js.map