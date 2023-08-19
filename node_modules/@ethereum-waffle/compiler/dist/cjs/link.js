"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.link = void 0;
const ethers_1 = require("ethers");
function link(contract, libraryName, libraryAddress) {
    const { object } = contract.evm.bytecode;
    if (object.indexOf('$') >= 0) {
        linkSolidity5(contract, libraryName, libraryAddress);
    }
    else {
        linkSolidity4(contract, libraryName, libraryAddress);
    }
}
exports.link = link;
function linkSolidity4(contract, libraryName, libraryAddress) {
    const address = libraryAddress.replace('0x', '');
    const libraryNamePrefix = libraryName.slice(0, 36);
    const pattern = new RegExp(`_+${libraryNamePrefix}_+`, 'g');
    if (!pattern.exec(contract.evm.bytecode.object)) {
        throw new Error(`Can't link '${libraryName}'.`);
    }
    contract.evm.bytecode.object = contract.evm.bytecode.object.replace(pattern, address);
}
function linkSolidity5(contract, libraryName, libraryAddress) {
    const address = libraryAddress.replace('0x', '');
    const encodedLibraryName = ethers_1.utils
        .solidityKeccak256(['string'], [libraryName])
        .slice(2, 36);
    const pattern = new RegExp(`_+\\$${encodedLibraryName}\\$_+`, 'g');
    const bytecode = contract.evm.bytecode.object;
    if (!pattern.exec(bytecode)) {
        throw new Error(`Can't link '${libraryName}'.`);
    }
    contract.evm.bytecode.object = bytecode.replace(pattern, address);
}
