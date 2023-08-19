"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
class TsGeneratorPlugin {
    constructor(ctx) {
        this.ctx = ctx;
        this.logger = ctx.logger || new logger_1.NoLogger();
    }
    beforeRun() { }
    afterRun() { }
}
exports.TsGeneratorPlugin = TsGeneratorPlugin;
