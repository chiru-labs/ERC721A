"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettierOutputTransformer = (output, { prettier }, cfg) => {
    const prettierCfg = Object.assign({}, (cfg.prettier || {}), { parser: "typescript" });
    return prettier.format(output, prettierCfg);
};
