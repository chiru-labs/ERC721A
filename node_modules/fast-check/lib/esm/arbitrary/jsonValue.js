import { string } from './string.js';
import { jsonConstraintsBuilder } from './_internals/helpers/JsonConstraintsBuilder.js';
import { anything } from './anything.js';
export function jsonValue(constraints = {}) {
    return anything(jsonConstraintsBuilder(string(), constraints));
}
