"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTopic = void 0;
function readTopic(pointer, state) {
    //not bothering with error handling on this one as I don't expect errors
    return state.eventtopics[pointer.topic];
}
exports.readTopic = readTopic;
//# sourceMappingURL=index.js.map