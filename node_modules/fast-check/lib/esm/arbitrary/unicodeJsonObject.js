import { unicodeJsonValue } from './unicodeJsonValue.js';
function unicodeJsonObject(constraints) {
    return typeof constraints === 'number'
        ? unicodeJsonValue({ maxDepth: constraints, depthFactor: 0 })
        : unicodeJsonValue(Object.assign(Object.assign({}, constraints), { depthFactor: constraints !== undefined && constraints.depthFactor !== undefined ? constraints.depthFactor : 0 }));
}
export { unicodeJsonObject };
