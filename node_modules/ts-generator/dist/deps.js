"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const prettier = require("prettier");
const mkdirp_1 = require("mkdirp");
const resolve = require("resolve");
const logger_1 = require("./logger");
function createDeps() {
    return {
        fs,
        prettier,
        mkdirp: mkdirp_1.sync,
        resolve: resolve.sync.bind(resolve),
        logger: new logger_1.ConsoleLogger("ts-gen", "info"),
    };
}
exports.createDeps = createDeps;
