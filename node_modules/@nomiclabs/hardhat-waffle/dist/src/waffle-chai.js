"use strict";
// This file only exists to workaround this: https://github.com/EthWorks/Waffle/issues/281
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waffleChai = void 0;
const path_1 = __importDefault(require("path"));
/// <reference types="chai" />
function waffleChai(chai, utils) {
    const wafflePath = require.resolve("ethereum-waffle");
    const waffleChaiPath = path_1.default.dirname(require.resolve("@ethereum-waffle/chai", {
        paths: [wafflePath],
    }));
    const { supportBigNumber } = require(`${waffleChaiPath}/matchers/bigNumber`);
    const { supportChangeBalance, } = require(`${waffleChaiPath}/matchers/changeBalance`);
    const { supportChangeBalances, } = require(`${waffleChaiPath}/matchers/changeBalances`);
    const { supportChangeEtherBalance, } = require(`${waffleChaiPath}/matchers/changeEtherBalance`);
    const { supportChangeEtherBalances, } = require(`${waffleChaiPath}/matchers/changeEtherBalances`);
    const { supportChangeTokenBalance, } = require(`${waffleChaiPath}/matchers/changeTokenBalance`);
    const { supportChangeTokenBalances, } = require(`${waffleChaiPath}/matchers/changeTokenBalances`);
    const { supportEmit } = require(`${waffleChaiPath}/matchers/emit`);
    const { supportProperAddress, } = require(`${waffleChaiPath}/matchers/properAddress`);
    const { supportProperHex } = require(`${waffleChaiPath}/matchers/properHex`);
    const { supportProperPrivateKey, } = require(`${waffleChaiPath}/matchers/properPrivateKey`);
    const { supportReverted } = require(`${waffleChaiPath}/matchers/reverted`);
    const { supportRevertedWith, } = require(`${waffleChaiPath}/matchers/revertedWith`);
    supportBigNumber(chai.Assertion, utils);
    supportReverted(chai.Assertion);
    supportRevertedWith(chai.Assertion);
    supportEmit(chai.Assertion);
    supportProperAddress(chai.Assertion);
    supportProperPrivateKey(chai.Assertion);
    supportProperHex(chai.Assertion);
    supportChangeBalance(chai.Assertion);
    supportChangeBalances(chai.Assertion);
    supportChangeEtherBalance(chai.Assertion);
    supportChangeEtherBalances(chai.Assertion);
    supportChangeTokenBalance(chai.Assertion);
    supportChangeTokenBalances(chai.Assertion);
    supportCalledOnContract(chai.Assertion);
    supportCalledOnContractWith(chai.Assertion);
}
exports.waffleChai = waffleChai;
function supportCalledOnContract(Assertion) {
    const Chai = require("chai");
    Assertion.addMethod("calledOnContract", function (contract) {
        throw new Chai.AssertionError("Waffle's calledOnContract is not supported by Hardhat");
    });
}
function supportCalledOnContractWith(Assertion) {
    const Chai = require("chai");
    Assertion.addMethod("calledOnContractWith", function (contract) {
        throw new Chai.AssertionError("Waffle's calledOnContractWith is not supported by Hardhat");
    });
}
//# sourceMappingURL=waffle-chai.js.map