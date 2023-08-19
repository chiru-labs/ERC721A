import { unicodeJsonValue } from './unicodeJsonValue.js';
function unicodeJson(constraints) {
    const arb = constraints != null ? unicodeJsonValue(constraints) : unicodeJsonValue();
    return arb.map(JSON.stringify);
}
export { unicodeJson };
