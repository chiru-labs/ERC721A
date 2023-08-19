import type { Contract, providers, Signer } from "ethers";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
export declare function getDeployMockContract(): any;
export declare function hardhatDeployContract(hre: HardhatRuntimeEnvironment, signer: Signer, contractJSON: any, args?: any[], overrideOptions?: providers.TransactionRequest): Promise<Contract>;
//# sourceMappingURL=deploy.d.ts.map