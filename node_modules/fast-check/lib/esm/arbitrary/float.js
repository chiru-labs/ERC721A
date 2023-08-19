import { floatNext } from './_next/floatNext.js';
import { integer } from './integer.js';
function next(n) {
    return integer(0, (1 << n) - 1);
}
const floatInternal = () => {
    return next(24).map((v) => v / (1 << 24));
};
function float(...args) {
    if (typeof args[0] === 'object') {
        if (args[0].next) {
            return floatNext(args[0]);
        }
        const min = args[0].min !== undefined ? args[0].min : 0;
        const max = args[0].max !== undefined ? args[0].max : 1;
        return (floatInternal()
            .map((v) => min + v * (max - min))
            .filter((g) => g !== max || g === min));
    }
    else {
        const a = args[0];
        const b = args[1];
        if (a === undefined)
            return floatInternal();
        if (b === undefined)
            return (floatInternal()
                .map((v) => v * a)
                .filter((g) => g !== a || g === 0));
        return (floatInternal()
            .map((v) => a + v * (b - a))
            .filter((g) => g !== b || g === a));
    }
}
export { float };
