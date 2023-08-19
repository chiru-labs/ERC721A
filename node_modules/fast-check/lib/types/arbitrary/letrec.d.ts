import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * For mutually recursive types
 *
 * @example
 * ```typescript
 * const { tree } = fc.letrec(tie => ({
 *   tree: fc.oneof({depthFactor: 0.5}, tie('leaf'), tie('node')),
 *   node: fc.tuple(tie('tree'), tie('tree')),
 *   leaf: fc.nat()
 * }));
 * // tree is 50% of node, 50% of leaf
 * // the ratio goes in favor of leaves as we go deeper in the tree (thanks to depthFactor)
 * ```
 *
 * @param builder - Arbitraries builder based on themselves (through `tie`)
 *
 * @remarks Since 1.16.0
 * @public
 */
export declare function letrec<T>(builder: (tie: (key: string) => Arbitrary<unknown>) => {
    [K in keyof T]: Arbitrary<T[K]>;
}): {
    [K in keyof T]: Arbitrary<T[K]>;
};
