export function seqEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
function isSequence(val) {
    return val.length !== undefined;
}
export function concatArgs(...args) {
    const ret = [];
    args.forEach(function (arg) {
        if (isSequence(arg)) {
            for (let j = 0; j < arg.length; j++) {
                ret.push(arg[j]);
            }
        }
        else {
            ret.push(arg);
        }
    });
    return ret;
}
