"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const info_1 = require("./info");
const prettier_1 = require("./prettier");
exports.outputTransformers = [info_1.infoOutputTransformer, prettier_1.prettierOutputTransformer];
