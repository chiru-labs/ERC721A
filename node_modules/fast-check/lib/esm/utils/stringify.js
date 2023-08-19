export const toStringMethod = Symbol('fast-check/toStringMethod');
export function hasToStringMethod(instance) {
    return (instance !== null &&
        (typeof instance === 'object' || typeof instance === 'function') &&
        toStringMethod in instance &&
        typeof instance[toStringMethod] === 'function');
}
export const asyncToStringMethod = Symbol('fast-check/asyncToStringMethod');
export function hasAsyncToStringMethod(instance) {
    return (instance !== null &&
        (typeof instance === 'object' || typeof instance === 'function') &&
        asyncToStringMethod in instance &&
        typeof instance[asyncToStringMethod] === 'function');
}
const findSymbolNameRegex = /^Symbol\((.*)\)$/;
function getSymbolDescription(s) {
    if (s.description !== undefined)
        return s.description;
    const m = findSymbolNameRegex.exec(String(s));
    return m && m[1].length ? m[1] : null;
}
function stringifyNumber(numValue) {
    switch (numValue) {
        case 0:
            return 1 / numValue === Number.NEGATIVE_INFINITY ? '-0' : '0';
        case Number.NEGATIVE_INFINITY:
            return 'Number.NEGATIVE_INFINITY';
        case Number.POSITIVE_INFINITY:
            return 'Number.POSITIVE_INFINITY';
        default:
            return numValue === numValue ? String(numValue) : 'Number.NaN';
    }
}
function isSparseArray(arr) {
    let previousNumberedIndex = -1;
    for (const index in arr) {
        const numberedIndex = Number(index);
        if (numberedIndex !== previousNumberedIndex + 1)
            return true;
        previousNumberedIndex = numberedIndex;
    }
    return previousNumberedIndex + 1 !== arr.length;
}
export function stringifyInternal(value, previousValues, getAsyncContent) {
    const currentValues = previousValues.concat([value]);
    if (typeof value === 'object') {
        if (previousValues.indexOf(value) !== -1) {
            return '[cyclic]';
        }
    }
    if (hasAsyncToStringMethod(value)) {
        const content = getAsyncContent(value);
        if (content.state === 'fulfilled') {
            return content.value;
        }
    }
    if (hasToStringMethod(value)) {
        try {
            return value[toStringMethod]();
        }
        catch (err) {
        }
    }
    switch (Object.prototype.toString.call(value)) {
        case '[object Array]': {
            const arr = value;
            if (arr.length >= 50 && isSparseArray(arr)) {
                const assignments = [];
                for (const index in arr) {
                    if (!Number.isNaN(Number(index)))
                        assignments.push(`${index}:${stringifyInternal(arr[index], currentValues, getAsyncContent)}`);
                }
                return assignments.length !== 0
                    ? `Object.assign(Array(${arr.length}),{${assignments.join(',')}})`
                    : `Array(${arr.length})`;
            }
            const stringifiedArray = arr.map((v) => stringifyInternal(v, currentValues, getAsyncContent)).join(',');
            return arr.length === 0 || arr.length - 1 in arr ? `[${stringifiedArray}]` : `[${stringifiedArray},]`;
        }
        case '[object BigInt]':
            return `${value}n`;
        case '[object Boolean]':
            return typeof value === 'boolean' ? JSON.stringify(value) : `new Boolean(${JSON.stringify(value)})`;
        case '[object Date]': {
            const d = value;
            return Number.isNaN(d.getTime()) ? `new Date(NaN)` : `new Date(${JSON.stringify(d.toISOString())})`;
        }
        case '[object Map]':
            return `new Map(${stringifyInternal(Array.from(value), currentValues, getAsyncContent)})`;
        case '[object Null]':
            return `null`;
        case '[object Number]':
            return typeof value === 'number' ? stringifyNumber(value) : `new Number(${stringifyNumber(Number(value))})`;
        case '[object Object]': {
            try {
                const toStringAccessor = value.toString;
                if (typeof toStringAccessor === 'function' && toStringAccessor !== Object.prototype.toString) {
                    return value.toString();
                }
            }
            catch (err) {
                return '[object Object]';
            }
            const mapper = (k) => `${k === '__proto__'
                ? '["__proto__"]'
                : typeof k === 'symbol'
                    ? `[${stringifyInternal(k, currentValues, getAsyncContent)}]`
                    : JSON.stringify(k)}:${stringifyInternal(value[k], currentValues, getAsyncContent)}`;
            const stringifiedProperties = [
                ...Object.keys(value).map(mapper),
                ...Object.getOwnPropertySymbols(value)
                    .filter((s) => {
                    const descriptor = Object.getOwnPropertyDescriptor(value, s);
                    return descriptor && descriptor.enumerable;
                })
                    .map(mapper),
            ];
            const rawRepr = '{' + stringifiedProperties.join(',') + '}';
            if (Object.getPrototypeOf(value) === null) {
                return rawRepr === '{}' ? 'Object.create(null)' : `Object.assign(Object.create(null),${rawRepr})`;
            }
            return rawRepr;
        }
        case '[object Set]':
            return `new Set(${stringifyInternal(Array.from(value), currentValues, getAsyncContent)})`;
        case '[object String]':
            return typeof value === 'string' ? JSON.stringify(value) : `new String(${JSON.stringify(value)})`;
        case '[object Symbol]': {
            const s = value;
            if (Symbol.keyFor(s) !== undefined) {
                return `Symbol.for(${JSON.stringify(Symbol.keyFor(s))})`;
            }
            const desc = getSymbolDescription(s);
            if (desc === null) {
                return 'Symbol()';
            }
            const knownSymbol = desc.startsWith('Symbol.') && Symbol[desc.substring(7)];
            return s === knownSymbol ? desc : `Symbol(${JSON.stringify(desc)})`;
        }
        case '[object Promise]': {
            const promiseContent = getAsyncContent(value);
            switch (promiseContent.state) {
                case 'fulfilled':
                    return `Promise.resolve(${stringifyInternal(promiseContent.value, currentValues, getAsyncContent)})`;
                case 'rejected':
                    return `Promise.reject(${stringifyInternal(promiseContent.value, currentValues, getAsyncContent)})`;
                case 'pending':
                    return `new Promise(() => {/*pending*/})`;
                case 'unknown':
                default:
                    return `new Promise(() => {/*unknown*/})`;
            }
        }
        case '[object Error]':
            if (value instanceof Error) {
                return `new Error(${stringifyInternal(value.message, currentValues, getAsyncContent)})`;
            }
            break;
        case '[object Undefined]':
            return `undefined`;
        case '[object Int8Array]':
        case '[object Uint8Array]':
        case '[object Uint8ClampedArray]':
        case '[object Int16Array]':
        case '[object Uint16Array]':
        case '[object Int32Array]':
        case '[object Uint32Array]':
        case '[object Float32Array]':
        case '[object Float64Array]':
        case '[object BigInt64Array]':
        case '[object BigUint64Array]': {
            if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer === 'function' && Buffer.isBuffer(value)) {
                return `Buffer.from(${stringifyInternal(Array.from(value.values()), currentValues, getAsyncContent)})`;
            }
            const valuePrototype = Object.getPrototypeOf(value);
            const className = valuePrototype && valuePrototype.constructor && valuePrototype.constructor.name;
            if (typeof className === 'string') {
                const typedArray = value;
                const valuesFromTypedArr = typedArray.values();
                return `${className}.from(${stringifyInternal(Array.from(valuesFromTypedArr), currentValues, getAsyncContent)})`;
            }
            break;
        }
    }
    try {
        return value.toString();
    }
    catch (_a) {
        return Object.prototype.toString.call(value);
    }
}
export function stringify(value) {
    return stringifyInternal(value, [], () => ({ state: 'unknown', value: undefined }));
}
export function possiblyAsyncStringify(value) {
    const stillPendingMarker = Symbol();
    const pendingPromisesForCache = [];
    const cache = new Map();
    function createDelay0() {
        let handleId = null;
        const cancel = () => {
            if (handleId !== null) {
                clearTimeout(handleId);
            }
        };
        const delay = new Promise((resolve) => {
            handleId = setTimeout(() => {
                handleId = null;
                resolve(stillPendingMarker);
            }, 0);
        });
        return { delay, cancel };
    }
    const unknownState = { state: 'unknown', value: undefined };
    const getAsyncContent = function getAsyncContent(data) {
        const cacheKey = data;
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }
        const delay0 = createDelay0();
        const p = asyncToStringMethod in data
            ? Promise.resolve().then(() => data[asyncToStringMethod]())
            : data;
        p.catch(() => { });
        pendingPromisesForCache.push(Promise.race([p, delay0.delay]).then((successValue) => {
            if (successValue === stillPendingMarker)
                cache.set(cacheKey, { state: 'pending', value: undefined });
            else
                cache.set(cacheKey, { state: 'fulfilled', value: successValue });
            delay0.cancel();
        }, (errorValue) => {
            cache.set(cacheKey, { state: 'rejected', value: errorValue });
            delay0.cancel();
        }));
        cache.set(cacheKey, unknownState);
        return unknownState;
    };
    function loop() {
        const stringifiedValue = stringifyInternal(value, [], getAsyncContent);
        if (pendingPromisesForCache.length === 0) {
            return stringifiedValue;
        }
        return Promise.all(pendingPromisesForCache.splice(0)).then(loop);
    }
    return loop();
}
export async function asyncStringify(value) {
    return Promise.resolve(possiblyAsyncStringify(value));
}
