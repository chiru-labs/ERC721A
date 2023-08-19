/**
 * Shared constraints for:
 * - {@link json},
 * - {@link unicodeJson},
 * - {@link jsonValue},
 * - {@link unicodeJsonValue}
 *
 * @remarks Since 2.5.0
 * @public
 */
export interface JsonSharedConstraints {
    /**
     * Limit the depth of the object by increasing the probability to generate simple values (defined via values)
     * as we go deeper in the object.
     *
     * Example of values: 0.1 (small impact as depth increases), 0.5, 1 (huge impact as depth increases).
     *
     * @remarks Since 2.20.0
     */
    depthFactor?: number;
    /**
     * Maximal depth allowed
     * @remarks Since 2.5.0
     */
    maxDepth?: number;
}
/**
 * Typings for a Json array
 * @remarks Since 2.20.0
 * @public
 */
export interface JsonArray extends Array<JsonValue> {
}
/**
 * Typings for a Json object
 * @remarks Since 2.20.0
 * @public
 */
export declare type JsonObject = {
    [key in string]?: JsonValue;
};
/**
 * Typings for a Json value
 * @remarks Since 2.20.0
 * @public
 */
export declare type JsonValue = boolean | number | string | null | JsonArray | JsonObject;
