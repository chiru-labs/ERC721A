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
Object.defineProperty(exports, "__esModule", { value: true });
const StorageRead = __importStar(require("./storage/read"));
const StackRead = __importStar(require("./stack/read"));
const BytesRead = __importStar(require("./bytes/read"));
const AstConstantRead = __importStar(require("./ast-constant/read"));
const TopicRead = __importStar(require("./topic/read"));
const SpecialRead = __importStar(require("./special/read"));
const errors_1 = require("./errors");
function* read(pointer, state) {
    switch (pointer.location) {
        case "stack":
            return StackRead.readStack(pointer, state);
        case "storage":
            return yield* StorageRead.readStorage(pointer, state);
        case "memory":
        case "calldata":
        case "eventdata":
        case "returndata":
            return BytesRead.readBytes(pointer, state);
        case "code":
            //keeping this separate
            return yield* BytesRead.readCode(pointer, state);
        case "stackliteral":
            return StackRead.readStackLiteral(pointer);
        case "definition":
            return AstConstantRead.readDefinition(pointer);
        case "special":
            return SpecialRead.readSpecial(pointer, state);
        case "eventtopic":
            return TopicRead.readTopic(pointer, state);
        case "nowhere":
            throw new errors_1.DecodingError({
                kind: "UnusedImmutableError"
            });
    }
}
exports.default = read;
//# sourceMappingURL=read.js.map