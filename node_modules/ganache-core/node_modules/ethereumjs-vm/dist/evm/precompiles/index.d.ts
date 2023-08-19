import { PrecompileInput, PrecompileFunc } from './types';
interface Precompiles {
    [key: string]: PrecompileFunc;
}
declare const ripemdPrecompileAddress = "0000000000000000000000000000000000000003";
declare const precompiles: Precompiles;
declare function getPrecompile(address: string): PrecompileFunc;
export { precompiles, getPrecompile, PrecompileFunc, PrecompileInput, ripemdPrecompileAddress };
