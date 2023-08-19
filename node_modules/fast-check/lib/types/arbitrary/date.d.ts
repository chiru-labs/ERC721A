import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * For date between constraints.min or new Date(-8640000000000000) (included) and constraints.max or new Date(8640000000000000) (included)
 *
 * @param constraints - Constraints to apply when building instances
 *
 * @remarks Since 1.17.0
 * @public
 */
export declare function date(constraints?: {
    min?: Date;
    max?: Date;
}): Arbitrary<Date>;
