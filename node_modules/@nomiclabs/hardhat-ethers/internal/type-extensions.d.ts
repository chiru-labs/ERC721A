import type { ethers } from "ethers";
import "hardhat/types/runtime";
import type { FactoryOptions as FactoryOptionsT, getContractFactory as getContractFactoryT, HardhatEthersHelpers, Libraries as LibrariesT } from "../types";
declare module "hardhat/types/runtime" {
    interface HardhatRuntimeEnvironment {
        ethers: typeof ethers & HardhatEthersHelpers;
    }
    type Libraries = LibrariesT;
    type FactoryOptions = FactoryOptionsT;
    type getContractFactory = typeof getContractFactoryT;
}
//# sourceMappingURL=type-extensions.d.ts.map