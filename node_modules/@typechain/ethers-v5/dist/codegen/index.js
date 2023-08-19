"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codegenAbstractContractFactory = exports.codegenContractFactory = exports.codegenContractTypings = void 0;
const lodash_1 = require("lodash");
const types_1 = require("./types");
const functions_1 = require("./functions");
function codegenContractTypings(contract) {
    const contractImports = ['Contract', 'ContractTransaction'];
    const allFunctions = lodash_1.values(contract.functions)
        .map((fn) => functions_1.codegenFunctions({ returnResultObject: true }, fn) + functions_1.codegenFunctions({ isStaticCall: true }, fn))
        .join('');
    const optionalContractImports = ['Overrides', 'PayableOverrides', 'CallOverrides'];
    optionalContractImports.forEach((importName) => pushImportIfUsed(importName, allFunctions, contractImports));
    const template = `
  import { ethers, EventFilter, Signer, BigNumber, BigNumberish, PopulatedTransaction } from 'ethers';
  import { ${contractImports.join(', ')} } from '@ethersproject/contracts';
  import { BytesLike } from '@ethersproject/bytes';
  import { Listener, Provider } from '@ethersproject/providers';
  import { FunctionFragment, EventFragment, Result } from '@ethersproject/abi';

  interface ${contract.name}Interface extends ethers.utils.Interface {
    functions: {
      ${lodash_1.values(contract.functions)
        .map((v) => v[0])
        .map(generateInterfaceFunctionDescription)
        .join('\n')}
    };

    ${lodash_1.values(contract.functions)
        .map((v) => v[0])
        .map(generateEncodeFunctionDataOverload)
        .join('\n')}

    ${lodash_1.values(contract.functions)
        .map((v) => v[0])
        .map(generateDecodeFunctionResultOverload)
        .join('\n')}

    events: {
      ${lodash_1.values(contract.events)
        .map((v) => v[0])
        .map(generateInterfaceEventDescription)
        .join('\n')}
    };

    ${lodash_1.values(contract.events)
        .map((v) => v[0])
        .map(generateGetEventOverload)
        .join('\n')}
  }

  export class ${contract.name} extends Contract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;

    on(event: EventFilter | string, listener: Listener): this;
    once(event: EventFilter | string, listener: Listener): this;
    addListener(eventName: EventFilter | string, listener: Listener): this;
    removeAllListeners(eventName: EventFilter | string): this;
    removeListener(eventName: any, listener: Listener): this;

    interface: ${contract.name}Interface;

    functions: {
      ${lodash_1.values(contract.functions)
        .map(functions_1.codegenFunctions.bind(null, { returnResultObject: true }))
        .join('\n')}
    };

    ${lodash_1.values(contract.functions).map(functions_1.codegenFunctions.bind(null, {})).join('\n')}

    callStatic: {
      ${lodash_1.values(contract.functions)
        .map(functions_1.codegenFunctions.bind(null, { isStaticCall: true }))
        .join('\n')}
    };

    filters: {
      ${lodash_1.values(contract.events)
        .map((v) => v[0])
        .map(generateEvents)
        .join('\n')}
    };

    estimateGas: {
      ${lodash_1.values(contract.functions)
        .map(functions_1.codegenFunctions.bind(null, { overrideOutput: 'Promise<BigNumber>' }))
        .join('\n')}
    };

    populateTransaction: {
      ${lodash_1.values(contract.functions)
        .map(functions_1.codegenFunctions.bind(null, { overrideOutput: 'Promise<PopulatedTransaction>' }))
        .join('\n')}
    };
  }`;
    return template;
}
exports.codegenContractTypings = codegenContractTypings;
function codegenContractFactory(contract, abi, bytecode) {
    var _a;
    const constructorArgs = (contract.constructor && contract.constructor[0] ? types_1.generateInputTypes(contract.constructor[0].inputs) : '') +
        `overrides?: ${((_a = contract.constructor[0]) === null || _a === void 0 ? void 0 : _a.stateMutability) === 'payable' ? 'PayableOverrides' : 'Overrides'}`;
    const constructorArgNamesWithoutOverrides = contract.constructor && contract.constructor[0] ? generateParamNames(contract.constructor[0].inputs) : '';
    const constructorArgNames = constructorArgNamesWithoutOverrides
        ? `${constructorArgNamesWithoutOverrides}, overrides || {}`
        : 'overrides || {}';
    if (!bytecode)
        return codegenAbstractContractFactory(contract, abi);
    // tsc with noUnusedLocals would complain about unused imports
    const ethersImports = ['Signer'];
    const optionalEthersImports = ['BytesLike', 'BigNumberish'];
    optionalEthersImports.forEach((importName) => pushImportIfUsed(importName, constructorArgs, ethersImports));
    const ethersContractImports = ['Contract', 'ContractFactory'];
    const optionalContractImports = ['PayableOverrides', 'Overrides'];
    optionalContractImports.forEach((importName) => pushImportIfUsed(importName, constructorArgs, ethersContractImports));
    return `
  import { ${ethersImports.join(', ')} } from "ethers";
  import { Provider, TransactionRequest } from '@ethersproject/providers';
  import { ${ethersContractImports.join(', ')} } from "@ethersproject/contracts";

  import type { ${contract.name} } from "./${contract.name}";

  export class ${contract.name}Factory extends ContractFactory {
    ${generateFactoryConstructor(contract, bytecode)}
    deploy(${constructorArgs}): Promise<${contract.name}> {
      return super.deploy(${constructorArgNames}) as Promise<${contract.name}>;
    }
    getDeployTransaction(${constructorArgs}): TransactionRequest {
      return super.getDeployTransaction(${constructorArgNames});
    };
    attach(address: string): ${contract.name} {
      return super.attach(address) as ${contract.name};
    }
    connect(signer: Signer): ${contract.name}Factory {
      return super.connect(signer) as ${contract.name}Factory;
    }
    static connect(address: string, signerOrProvider: Signer | Provider): ${contract.name} {
      return new Contract(address, _abi, signerOrProvider) as ${contract.name};
    }
  }

  const _abi = ${JSON.stringify(abi, null, 2)};

  const _bytecode = "${bytecode.bytecode}";

  ${generateLibraryAddressesInterface(contract, bytecode)}
  `;
}
exports.codegenContractFactory = codegenContractFactory;
function codegenAbstractContractFactory(contract, abi) {
    return `
  import { Contract, Signer } from "ethers";
  import { Provider } from "@ethersproject/providers";

  import type { ${contract.name} } from "./${contract.name}";

  export class ${contract.name}Factory {
    static connect(address: string, signerOrProvider: Signer | Provider): ${contract.name} {
      return new Contract(address, _abi, signerOrProvider) as ${contract.name};
    }
  }

  const _abi = ${JSON.stringify(abi, null, 2)};
  `;
}
exports.codegenAbstractContractFactory = codegenAbstractContractFactory;
function generateFactoryConstructor(contract, bytecode) {
    if (!bytecode.linkReferences) {
        return `
    constructor(signer?: Signer) {
      super(_abi, _bytecode, signer);
    }
    `;
    }
    const linkRefReplacements = bytecode.linkReferences.map((linkRef) => {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
        // We're using a double escape backslash, since the string will be pasted into generated code.
        const escapedLinkRefRegex = linkRef.reference.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
        const libraryKey = linkRef.name || linkRef.reference;
        return `
      linkedBytecode = linkedBytecode.replace(
        new RegExp("${escapedLinkRefRegex}", "g"),
        linkLibraryAddresses["${libraryKey}"].replace(/^0x/, '').toLowerCase(),
      );`;
    });
    return `
    constructor(linkLibraryAddresses: ${contract.name}LibraryAddresses, signer?: Signer) {
      super(_abi, ${contract.name}Factory.linkBytecode(linkLibraryAddresses), signer);
    }

    static linkBytecode(linkLibraryAddresses: ${contract.name}LibraryAddresses): string {
      let linkedBytecode = _bytecode;
      ${linkRefReplacements.join('\n')}

      return linkedBytecode;
    }
  `;
}
function generateLibraryAddressesInterface(contract, bytecode) {
    if (!bytecode.linkReferences)
        return '';
    const linkLibrariesKeys = bytecode.linkReferences.map((linkRef) => `    ["${linkRef.name || linkRef.reference}"]: string;`);
    return `
  export interface ${contract.name}LibraryAddresses {
    ${linkLibrariesKeys.join('\n')}
  };`;
}
function generateInterfaceFunctionDescription(fn) {
    return `'${generateFunctionSignature(fn)}': FunctionFragment;`;
}
function generateFunctionSignature(fn) {
    return `${fn.name}(${fn.inputs.map((input) => input.type.originalType).join(',')})`;
}
function generateEncodeFunctionDataOverload(fn) {
    const methodInputs = [`functionFragment: '${fn.name}'`];
    if (fn.inputs.length) {
        methodInputs.push(`values: [${fn.inputs.map((input) => types_1.generateInputType(input.type)).join(', ')}]`);
    }
    else {
        methodInputs.push('values?: undefined');
    }
    return `encodeFunctionData(${methodInputs.join(', ')}): string;`;
}
function generateDecodeFunctionResultOverload(fn) {
    return `decodeFunctionResult(functionFragment: '${fn.name}', data: BytesLike): Result;`;
}
function generateParamNames(params) {
    return params.map((param) => param.name).join(', ');
}
function generateEvents(event) {
    return `
  ${event.name}(${generateEventTypes(event.inputs)}): EventFilter;
`;
}
function generateInterfaceEventDescription(event) {
    return `'${generateEventSignature(event)}': EventFragment;`;
}
function generateEventSignature(event) {
    return `${event.name}(${event.inputs.map((input) => input.type.originalType).join(',')})`;
}
function generateEventTypes(eventArgs) {
    if (eventArgs.length === 0) {
        return '';
    }
    return (eventArgs
        .map((arg) => {
        return `${arg.name}: ${generateEventArgType(arg)}`;
    })
        .join(', ') + ', ');
}
function generateEventArgType(eventArg) {
    return eventArg.isIndexed ? `${types_1.generateInputType(eventArg.type)} | null` : 'null';
}
function generateGetEventOverload(event) {
    return `getEvent(nameOrSignatureOrTopic: '${event.name}'): EventFragment;`;
}
function pushImportIfUsed(importName, generatedCode, importArray) {
    if (new RegExp(`\\W${importName}(\\W|$)`).test(generatedCode))
        importArray.push(importName);
}
//# sourceMappingURL=index.js.map