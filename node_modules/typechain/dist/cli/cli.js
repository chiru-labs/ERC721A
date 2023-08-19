#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_generator_1 = require("ts-generator");
const parseArgs_1 = require("./parseArgs");
const TypeChain_1 = require("../TypeChain");
const logger_1 = require("../utils/logger");
async function main() {
    ;
    global.IS_CLI = true;
    const options = parseArgs_1.parseArgs();
    const cwd = process.cwd();
    await ts_generator_1.tsGenerator({ cwd, loggingLvl: 'info' }, new TypeChain_1.TypeChain({ cwd, rawConfig: options }));
}
main().catch((e) => {
    logger_1.logger.error('Error occured: ', e.message);
    const stackTracesEnabled = process.argv.includes('--show-stack-traces');
    if (stackTracesEnabled) {
        logger_1.logger.error('Stack trace: ', e.stack);
    }
    else {
        logger_1.logger.error('Run with --show-stack-traces to see the full stacktrace');
    }
    process.exit(1);
});
//# sourceMappingURL=cli.js.map