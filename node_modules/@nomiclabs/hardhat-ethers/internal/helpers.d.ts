import type { ethers } from "ethers";
import { Artifact, HardhatRuntimeEnvironment } from "hardhat/types";
import type { SignerWithAddress } from "../signers";
import type { FactoryOptions } from "../types";
export declare function getSigners(hre: HardhatRuntimeEnvironment): Promise<SignerWithAddress[]>;
export declare function getSigner(hre: HardhatRuntimeEnvironment, address: string): Promise<SignerWithAddress>;
export declare function getContractFactory(hre: HardhatRuntimeEnvironment, name: string, signerOrOptions?: ethers.Signer | FactoryOptions): Promise<ethers.ContractFactory>;
export declare function getContractFactory(hre: HardhatRuntimeEnvironment, abi: any[], bytecode: ethers.utils.BytesLike, signer?: ethers.Signer): Promise<ethers.ContractFactory>;
export declare function getContractFactoryFromArtifact(hre: HardhatRuntimeEnvironment, artifact: Artifact, signerOrOptions?: ethers.Signer | FactoryOptions): Promise<ethers.ContractFactory>;
export declare function getContractAt(hre: HardhatRuntimeEnvironment, nameOrAbi: string | any[], address: string, signer?: ethers.Signer): Promise<ethers.Contract>;
export declare function getContractAtFromArtifact(hre: HardhatRuntimeEnvironment, artifact: Artifact, address: string, signer?: ethers.Signer): Promise<ethers.Contract>;
//# sourceMappingURL=helpers.d.ts.map