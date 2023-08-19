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
exports.decodeTopic = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:topic:decode");
const read_1 = __importDefault(require("../../read"));
const Basic = __importStar(require("../../basic"));
const Format = __importStar(require("../../format"));
const Conversion = __importStar(require("../../conversion"));
function* decodeTopic(dataType, pointer, info, options = {}) {
    if (Format.Types.isReferenceType(dataType) ||
        dataType.typeClass === "tuple") {
        //we cannot decode reference types "stored" in topics; we have to just return an error
        let bytes = yield* read_1.default(pointer, info.state);
        let raw = Conversion.toHexString(bytes);
        //NOTE: even in strict mode we want to just return this, not throw an error here
        return {
            //dunno why TS is failing here
            type: dataType,
            kind: "error",
            error: {
                kind: "IndexedReferenceTypeError",
                type: dataType,
                raw
            }
        };
    }
    //otherwise, dispatch to decodeBasic
    return yield* Basic.Decode.decodeBasic(dataType, pointer, info, options);
}
exports.decodeTopic = decodeTopic;
//# sourceMappingURL=index.js.map