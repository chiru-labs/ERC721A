"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectAllocationInfo = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:abi-data:allocate:utils");
const Compilations = __importStar(require("../../compilations"));
const compile_common_1 = require("@truffle/compile-common");
const Contexts = __importStar(require("../../contexts"));
const Abi = __importStar(require("@truffle/abi-utils"));
function collectAllocationInfo(compilations) {
    let contexts = {};
    let deployedContexts = {};
    let contractsAndContexts = [];
    for (const compilation of compilations) {
        for (const contract of compilation.contracts) {
            const node = Compilations.Utils.getContractNode(contract, compilation);
            let deployedContext = undefined;
            let constructorContext = undefined;
            const deployedBytecode = compile_common_1.Shims.NewToLegacy.forBytecode(contract.deployedBytecode);
            const bytecode = compile_common_1.Shims.NewToLegacy.forBytecode(contract.bytecode);
            if (deployedBytecode && deployedBytecode !== "0x") {
                deployedContext = Contexts.Utils.makeContext(contract, node, compilation);
                contexts[deployedContext.context] = deployedContext;
                //note that we don't set up deployedContexts until after normalization!
            }
            if (bytecode && bytecode !== "0x") {
                constructorContext = Contexts.Utils.makeContext(contract, node, compilation, true);
                contexts[constructorContext.context] = constructorContext;
            }
            contractsAndContexts.push({
                contract,
                node,
                deployedContext,
                constructorContext,
                compilationId: compilation.id
            });
        }
    }
    debug("known contexts: %o", Object.keys(contexts));
    contexts = Contexts.Utils.normalizeContexts(contexts);
    deployedContexts = Object.assign({}, ...Object.values(contexts).map(context => !context.isConstructor ? { [context.context]: context } : {}));
    for (const contractAndContexts of contractsAndContexts) {
        //change everything to normalized version
        if (contractAndContexts.deployedContext) {
            contractAndContexts.deployedContext =
                contexts[contractAndContexts.deployedContext.context]; //get normalized version
        }
        if (contractAndContexts.constructorContext) {
            contractAndContexts.constructorContext =
                contexts[contractAndContexts.constructorContext.context]; //get normalized version
        }
    }
    const allocationInfo = contractsAndContexts.map(({ contract: { abi, compiler, immutableReferences }, compilationId, node, deployedContext, constructorContext }) => ({
        abi: Abi.normalize(abi),
        compilationId,
        compiler,
        contractNode: node,
        deployedContext,
        constructorContext,
        immutableReferences
    }));
    return {
        contexts,
        deployedContexts,
        contractsAndContexts,
        allocationInfo
    };
}
exports.collectAllocationInfo = collectAllocationInfo;
//# sourceMappingURL=utils.js.map