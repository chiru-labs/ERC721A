import { jsonValue } from './jsonValue.js';
function jsonObject(constraints) {
    return typeof constraints === 'number'
        ? jsonValue({ maxDepth: constraints, depthFactor: 0 })
        : jsonValue(Object.assign(Object.assign({}, constraints), { depthFactor: constraints !== undefined && constraints.depthFactor !== undefined ? constraints.depthFactor : 0 }));
}
export { jsonObject };
