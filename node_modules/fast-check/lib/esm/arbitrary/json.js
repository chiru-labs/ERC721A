import { jsonValue } from './jsonValue.js';
function json(constraints) {
    const arb = constraints != null ? jsonValue(constraints) : jsonValue();
    return arb.map(JSON.stringify);
}
export { json };
