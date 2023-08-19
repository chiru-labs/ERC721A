import { utils } from 'ethers';
export class CallHistory {
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
        address: message.to ? utils.getAddress(utils.hexlify(message.to)) : undefined,
        data: message.data ? utils.hexlify(message.data) : '0x'
    };
}
