"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ts_generator_1 = require("ts-generator");
const typechain_1 = require("typechain");
const codegen_1 = require("./codegen");
const DEFAULT_OUT_PATH = './types/ethers-contracts/';
class Ethers extends ts_generator_1.TsGeneratorPlugin {
    constructor(ctx) {
        super(ctx);
        this.name = 'Ethers';
        this.contractFiles = [];
        this.contractCache = {};
        this.bytecodeCache = {};
        const { cwd, rawConfig } = ctx;
        this.outDirAbs = path_1.resolve(cwd, rawConfig.outDir || DEFAULT_OUT_PATH);
    }
    transformFile(file) {
        const fileExt = typechain_1.getFileExtension(file.path);
        // For json files with both ABI and bytecode, both the contract typing and factory can be
        // generated at once. For split files (.abi and .bin) we don't know in which order they will
        // be transformed -- so we temporarily store whichever comes first, and generate the factory
        // only when both ABI and bytecode are present.
        // TODO we might want to add a configuration switch to control whether we want to generate the
        // factories, or just contract type declarations.
        if (fileExt === '.bin') {
            return this.transformBinFile(file);
        }
        return this.transformAbiOrFullJsonFile(file);
    }
    transformBinFile(file) {
        const name = typechain_1.getFilename(file.path);
        const bytecode = typechain_1.extractBytecode(file.contents);
        if (!bytecode) {
            return;
        }
        if (this.contractCache[name]) {
            const { contract, abi } = this.contractCache[name];
            delete this.contractCache[name];
            return [this.genContractFactoryFile(contract, abi, bytecode)];
        }
        else {
            this.bytecodeCache[name] = bytecode;
        }
    }
    transformAbiOrFullJsonFile(file) {
        const name = typechain_1.getFilename(file.path);
        const abi = typechain_1.extractAbi(file.contents);
        if (abi.length === 0) {
            return;
        }
        const documentation = typechain_1.extractDocumentation(file.contents);
        const contract = typechain_1.parse(abi, name, documentation);
        const bytecode = typechain_1.extractBytecode(file.contents) || this.bytecodeCache[name];
        if (bytecode) {
            return [this.genContractTypingsFile(contract), this.genContractFactoryFile(contract, abi, bytecode)];
        }
        else {
            this.contractCache[name] = { abi, contract };
            return [this.genContractTypingsFile(contract)];
        }
    }
    genContractTypingsFile(contract) {
        return {
            path: path_1.join(this.outDirAbs, `${contract.name}.d.ts`),
            contents: codegen_1.codegenContractTypings(contract),
        };
    }
    genContractFactoryFile(contract, abi, bytecode) {
        this.contractFiles.push(`${contract.name}`);
        return {
            path: path_1.join(this.outDirAbs, `${contract.name}Factory.ts`),
            contents: codegen_1.codegenContractFactory(contract, abi, bytecode),
        };
    }
    afterRun() {
        // For each contract that doesn't have bytecode (it's either abstract, or only ABI was provided)
        // generate a simplified factory, that allows to interact with deployed contract instances.
        const abstractFactoryFiles = Object.keys(this.contractCache).map((contractName) => {
            const { contract, abi } = this.contractCache[contractName];
            return {
                path: path_1.join(this.outDirAbs, `${contract.name}Factory.ts`),
                contents: codegen_1.codegenAbstractContractFactory(contract, abi),
            };
        });
        return [
            ...abstractFactoryFiles,
            {
                path: path_1.join(this.outDirAbs, 'index.ts'),
                contents: this.contractFiles
                    .map((fileName) => [
                    `export { ${fileName}Factory } from './${fileName}Factory'`,
                    `export type { ${fileName} } from './${fileName}'`,
                ].join('\n'))
                    .join('\n'),
            },
        ];
    }
}
exports.default = Ethers;
//# sourceMappingURL=index.js.map