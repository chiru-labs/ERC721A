export function ensure(condition, ErrorToThrow, ...errorArgs) {
    if (!condition) {
        throw new ErrorToThrow(...errorArgs);
    }
}
