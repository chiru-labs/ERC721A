import { TContext, TFileDesc, TsGeneratorPlugin } from 'ts-generator';
import { BytecodeWithLinkReferences, Contract } from 'typechain';
export interface IEthersCfg {
    outDir?: string;
}
export default class Ethers extends TsGeneratorPlugin {
    name: string;
    contractFiles: string[];
    private readonly outDirAbs;
    private readonly contractCache;
    private readonly bytecodeCache;
    constructor(ctx: TContext<IEthersCfg>);
    transformFile(file: TFileDesc): TFileDesc[] | void;
    transformBinFile(file: TFileDesc): TFileDesc[] | void;
    transformAbiOrFullJsonFile(file: TFileDesc): TFileDesc[] | void;
    genContractTypingsFile(contract: Contract): TFileDesc;
    genContractFactoryFile(contract: Contract, abi: any, bytecode?: BytecodeWithLinkReferences): {
        path: string;
        contents: string;
    };
    afterRun(): TFileDesc[];
}
