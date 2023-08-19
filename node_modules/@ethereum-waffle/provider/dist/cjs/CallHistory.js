"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallHistory = void 0;
const ethers_1 = require("ethers");
class CallHistory {
    constructor() {
        this.recordedCalls = [];
    }
    clear() {
        this.recordedCalls = [];
    }
    getCalls() {
        return this.recordedCalls;
    }
    record(provider) {
        addVmListener(provider, 'beforeMessage', (message) => {
            this.recordedCalls.push(toRecordedCall(message));
        });
    }
}
exports.CallHistory = CallHistory;
function addVmListener(provider, event, handler) {
    const { blockchain } = provider.provider.engine.manager.state;
    const createVMFromStateTrie = blockchain.createVMFromStateTrie;
    blockchain.createVMFromStateTrie = function (...args) {
        const vm = createVMFromStateTrie.apply(this, args);
        vm.on(event, handler);
        return vm;
    };
}
function toRecordedCall(message) {
    return {
        address: message.to ? ethers_1.utils.getAddress(ethers_1.utils.hexlify(message.to)) : undefined,
        data: message.data ? ethers_1.utils.hexlify(message.data) : '0x'
    };
}
