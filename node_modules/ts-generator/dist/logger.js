"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-console */
const chalk_1 = require("chalk");
const { gray, green, yellow, red } = chalk_1.default;
const loggerLvlToNumber = {
    verbose: 2,
    info: 1,
    error: 0,
};
class ConsoleLogger {
    constructor(name, lvl) {
        this.name = name;
        this.lvl = lvl;
    }
    prefix() {
        return `${gray(this.name)}:`;
    }
    info(...args) {
        if (loggerLvlToNumber["info"] <= loggerLvlToNumber[this.lvl]) {
            console.info(this.prefix(), ...args);
        }
    }
    verbose(...args) {
        if (loggerLvlToNumber["verbose"] <= loggerLvlToNumber[this.lvl]) {
            console.info(this.prefix(), ...args);
        }
    }
    error(...args) {
        if (loggerLvlToNumber["error"] <= loggerLvlToNumber[this.lvl]) {
            console.error(this.prefix(), ...args.map((m) => red(m)));
        }
    }
    warn(...args) {
        console.info(this.prefix(), ...args.map((m) => yellow(m)));
    }
    accent(s) {
        return green(s);
    }
    childLogger(name) {
        return new ConsoleLogger(name, this.lvl);
    }
}
exports.ConsoleLogger = ConsoleLogger;
class NoLogger {
    constructor() {
        this.lvl = "error";
    }
    info() { }
    verbose() { }
    error() { }
    warn() { }
    accent(s) {
        return s;
    }
    childLogger() {
        return new NoLogger();
    }
}
exports.NoLogger = NoLogger;
