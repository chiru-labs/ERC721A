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
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:decode");
const AstConstant = __importStar(require("./ast-constant"));
const AbiData = __importStar(require("./abi-data"));
const Compiler = __importStar(require("./compiler"));
const Format = __importStar(require("./format"));
const Basic = __importStar(require("./basic"));
const Memory = __importStar(require("./memory"));
const Special = __importStar(require("./special"));
const Stack = __importStar(require("./stack"));
const Storage = __importStar(require("./storage"));
const Topic = __importStar(require("./topic"));
function* decode(dataType, pointer, info, options = {}) {
    return Format.Utils.Circularity.tie(yield* decodeDispatch(dataType, pointer, info, options));
}
exports.default = decode;
function* decodeDispatch(dataType, pointer, info, options = {}) {
    debug("type %O", dataType);
    debug("pointer %O", pointer);
    switch (pointer.location) {
        case "storage":
            return yield* Storage.Decode.decodeStorage(dataType, pointer, info);
        case "stack":
            return yield* Stack.Decode.decodeStack(dataType, pointer, info);
        case "stackliteral":
            return yield* Stack.Decode.decodeLiteral(dataType, pointer, info);
        case "definition":
            return yield* AstConstant.Decode.decodeConstant(dataType, pointer, info);
        case "special":
            return yield* Special.Decode.decodeSpecial(dataType, pointer, info);
        case "calldata":
        case "eventdata":
        case "returndata":
            return yield* AbiData.Decode.decodeAbi(dataType, pointer, info, options);
        case "eventtopic":
            return yield* Topic.Decode.decodeTopic(dataType, pointer, info, options);
        case "code":
        case "nowhere":
            //currently only basic types can go in code, so we'll dispatch directly to decodeBasic
            //(if it's a nowhere pointer, this will return an error result, of course)
            //(also, Solidity <0.8.9 would always zero-pad immutables regardless of type,
            //so we have to set the padding mode appropriately to allow for this)
            return yield* Basic.Decode.decodeBasic(dataType, pointer, info, Object.assign(Object.assign({}, options), { paddingMode: "defaultOrZero" }));
        case "memory":
            //this case -- decoding something that resides *directly* in memory,
            //rather than located via a pointer -- only comes up when decoding immutables
            //in a constructor.  thus, we turn on the forceRightPadding option on Solidity
            //versions prior to 0.8.9, because before then all immutables would be right-padded
            //while in memory
            switch (Compiler.Utils.solidityFamily(info.currentContext.compiler)) {
                case "0.5.x":
                case "0.8.x":
                case "0.8.7+":
                    return yield* Memory.Decode.decodeMemory(dataType, pointer, info, Object.assign(Object.assign({}, options), { paddingMode: "right" }));
                default:
                    return yield* Memory.Decode.decodeMemory(dataType, pointer, info, options);
            }
    }
}
//# sourceMappingURL=decode.js.map