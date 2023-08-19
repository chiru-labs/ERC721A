#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("./cli");
const configPathRel = process.argv[2];
// tslint:disable-next-line
console.assert(configPathRel, "You need to provide config path!");
cli_1.cli(configPathRel).catch((e) => {
    // tslint:disable-next-line
    console.log("💣 Error occured!");
    // tslint:disable-next-line
    console.error(e);
    process.exit(1);
});
