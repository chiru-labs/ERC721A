"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
class Logger {
    log(...args) {
        if (!global.IS_CLI) {
            return;
        }
        console.log(...args);
    }
    warn(...args) {
        if (!global.IS_CLI) {
            return;
        }
        console.warn(...args);
    }
    error(...args) {
        if (!global.IS_CLI) {
            return;
        }
        console.error(...args);
    }
}
exports.Logger = Logger;
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map