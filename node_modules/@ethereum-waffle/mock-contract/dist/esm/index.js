import { Contract, ContractFactory, utils } from 'ethers';
import DoppelgangerContract from './Doppelganger.json';
async function deploy(signer) {
    const factory = new ContractFactory(DoppelgangerContract.abi, DoppelgangerContract.bytecode, signer);
    return factory.deploy();
}
function stub(mockContract, encoder, func, params) {
    const callData = params
        ? mockContract.interface.encodeFunctionData(func, params)
        : mockContract.interface.getSighash(func);
    return {
        returns: async (...args) => {
            if (!func.outputs)
                return;
            const encoded = encoder.encode(func.outputs, args);
            await mockContract.__waffle__mockReturns(callData, encoded);
        },
        reverts: async () => mockContract.__waffle__mockReverts(callData, 'Mock revert'),
        revertsWithReason: async (reason) => mockContract.__waffle__mockReverts(callData, reason),
        withArgs: (...args) => stub(mockContract, encoder, func, args)
    };
}
function createMock(abi, mockContractInstance) {
    const { functions } = new utils.Interface(abi);
    const encoder = new utils.AbiCoder();
    const mockedAbi = Object.values(functions).reduce((acc, func) => {
        const stubbed = stub(mockContractInstance, encoder, func);
        return {
            ...acc,
            [func.name]: stubbed,
            [func.format()]: stubbed
        };
    }, {});
    return mockedAbi;
}
export async function deployMockContract(signer, abi) {
    const mockContractInstance = await deploy(signer);
    const mock = createMock(abi, mockContractInstance);
    const mockedContract = new Contract(mockContractInstance.address, abi, signer);
    mockedContract.mock = mock;
    const encoder = new utils.AbiCoder();
    mockedContract.staticcall = async (contract, functionName, ...params) => {
        let func = contract.interface.functions[functionName];
        if (!func) {
            func = Object.values(contract.interface.functions).find(f => f.name === functionName);
        }
        if (!func) {
            throw new Error(`Unknown function ${functionName}`);
        }
        if (!func.outputs) {
            throw new Error('Cannot staticcall function with no outputs');
        }
        const tx = await contract.populateTransaction[functionName](...params);
        const data = tx.data;
        let result;
        const returnValue = await mockContractInstance.__waffle__staticcall(contract.address, data);
        result = encoder.decode(func.outputs, returnValue);
        if (result.length === 1) {
            result = result[0];
        }
        return result;
    };
    mockedContract.call = async (contract, functionName, ...params) => {
        const tx = await contract.populateTransaction[functionName](...params);
        const data = tx.data;
        return mockContractInstance.__waffle__call(contract.address, data);
    };
    return mockedContract;
}
