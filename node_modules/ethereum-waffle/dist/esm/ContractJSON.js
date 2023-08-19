export const isStandard = (data) => typeof data.evm === 'object' &&
    data.evm !== null &&
    typeof data.evm.bytecode === 'object' &&
    data.evm.bytecode !== null;
export function hasByteCode(bytecode) {
    if (typeof bytecode === 'object') {
        return Object.entries(bytecode.object).length !== 0;
    }
    return Object.entries(bytecode).length !== 0;
}
