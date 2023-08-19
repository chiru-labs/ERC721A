"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = require("fs-extra");
var find_up_1 = __importDefault(require("find-up"));
var path_1 = require("path");
var DEFAULT_GAS = 2e5;
function localArtifactPath(contract, artifactsDir) {
    var buildDir = find_up_1.default.sync(artifactsDir, { type: 'directory' });
    if (!buildDir) {
        throw new Error("Could not find local " + artifactsDir + " when looking for local artifacts");
    }
    return path_1.join(buildDir, contract + ".json");
}
function dependencyArtifactPath(contractWithDependency) {
    var fragments = contractWithDependency.split('/');
    var contract = fragments.pop();
    var dependency = fragments.join('/');
    try {
        return require.resolve(dependency + "/build/contracts/" + contract + ".json");
    }
    catch (err) {
        throw new Error("Cannot find contract " + contractWithDependency + ": " + err.message);
    }
}
function loadArtifact(contract, artifactsDir) {
    var artifactPath = contract.includes('/')
        ? dependencyArtifactPath
        : function (c) { return localArtifactPath(c, artifactsDir); };
    return fs_extra_1.readJSONSync(artifactPath(contract), { encoding: 'utf8' });
}
var BaseLoader = /** @class */ (function () {
    function BaseLoader(providerOrWeb3, defaultSender, defaultGas, defaultGasPrice, artifactsDir) {
        if (artifactsDir === void 0) { artifactsDir = 'build/contracts'; }
        if (providerOrWeb3.currentProvider) {
            this.provider = providerOrWeb3.currentProvider;
            this.web3 = providerOrWeb3;
        }
        else {
            this.provider = providerOrWeb3;
        }
        this.defaultSender = defaultSender;
        this.defaultGas = defaultGas;
        this.defaultGasPrice = defaultGasPrice;
        this.artifactsDir = artifactsDir;
    }
    BaseLoader.prototype.fromArtifact = function (contract, address) {
        var _a = loadArtifact(contract, this.artifactsDir), abi = _a.abi, bytecode = _a.bytecode;
        return this.fromABI(abi, bytecode, address);
    };
    return BaseLoader;
}());
var Web3Loader = /** @class */ (function (_super) {
    __extends(Web3Loader, _super);
    function Web3Loader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Web3Loader.prototype.fromABI = function (abi, bytecode, address) {
        return new this.web3Contract(abi, address, {
            data: bytecode,
            from: this.defaultSender,
            gas: this.defaultGas,
            gasPrice: this.defaultGasPrice,
        });
    };
    Object.defineProperty(Web3Loader.prototype, "web3Contract", {
        get: function () {
            if (this._web3Contract === undefined) {
                // If we only have a web3 provider, then we need to require web3-eth-contract
                if (this.web3 === undefined) {
                    var libPath = require.resolve('web3-eth-contract');
                    if (libPath === undefined) {
                        throw new Error("Could not load package 'web3-eth-contract'. Please install it alongisde @openzeppelin/contract-loader.");
                    }
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    var lib = require(libPath);
                    lib.setProvider(this.provider);
                    this._web3Contract = lib;
                }
                // Otherwise, we can use the web3.eth.Contract directly, and not require any extra deps
                else {
                    this._web3Contract = this.web3.eth.Contract;
                }
            }
            return this._web3Contract;
        },
        enumerable: true,
        configurable: true
    });
    return Web3Loader;
}(BaseLoader));
exports.Web3Loader = Web3Loader;
var TruffleLoader = /** @class */ (function (_super) {
    __extends(TruffleLoader, _super);
    function TruffleLoader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TruffleLoader.prototype.fromABI = function (abi, bytecode, address) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        var abstraction = this.truffleContract({ abi: abi, unlinked_binary: bytecode });
        abstraction.setProvider(this.provider);
        abstraction.defaults({
            from: this.defaultSender,
            gas: this.defaultGas,
            gasPrice: this.defaultGasPrice,
        });
        if (address !== undefined)
            return new abstraction(address);
        return abstraction;
    };
    Object.defineProperty(TruffleLoader.prototype, "truffleContract", {
        get: function () {
            if (this._truffleContract === undefined) {
                var libPath = require.resolve('@truffle/contract');
                if (libPath === undefined) {
                    throw new Error("Could not load package '@truffle/contract'. Please install it alongisde @openzeppelin/contract-loader.");
                }
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                var lib = require(libPath);
                this._truffleContract = lib;
            }
            return this._truffleContract;
        },
        enumerable: true,
        configurable: true
    });
    return TruffleLoader;
}(BaseLoader));
exports.TruffleLoader = TruffleLoader;
function setupLoader(_a) {
    var provider = _a.provider, defaultSender = _a.defaultSender, _b = _a.defaultGas, defaultGas = _b === void 0 ? DEFAULT_GAS : _b, defaultGasPrice = _a.defaultGasPrice, artifactsDir = _a.artifactsDir;
    return {
        web3: new Web3Loader(provider, defaultSender, defaultGas, defaultGasPrice, artifactsDir),
        truffle: new TruffleLoader(provider, defaultSender, defaultGas, defaultGasPrice, artifactsDir),
    };
}
exports.setupLoader = setupLoader;
//# sourceMappingURL=index.js.map