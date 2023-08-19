import { Address } from 'ethereumjs-util';
import Common from '@ethereumjs/common';
import { PrecompileInput, PrecompileFunc } from './types';
interface Precompiles {
    [key: string]: PrecompileFunc;
}
declare const ripemdPrecompileAddress = "0000000000000000000000000000000000000003";
declare const precompiles: Precompiles;
declare function getPrecompile(address: Address, common: Common): PrecompileFunc;
declare function getActivePrecompiles(common: Common): Address[];
export { precompiles, getPrecompile, PrecompileFunc, PrecompileInput, ripemdPrecompileAddress, getActivePrecompiles, };
