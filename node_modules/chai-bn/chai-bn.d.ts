import chai from "chai";
import BN from "bn.js";

export default function (BNModule: any): any;
declare global {
    export namespace Chai {
        export interface BNComparer extends NumberComparer {
            (value: BN | string, message?: string): BNAssertion;
        }
        export interface BNCloseTo extends CloseTo {
            (value: BN | string, delta: BN | string, message?: string): BNAssertion;
        }
        export interface BNBoolean {
            (): BNAssertion;
        }
        export interface BNAssertion extends Assertion {
            equal: BNComparer;
            equals: BNComparer;
            eq: BNComparer;
            above: BNComparer;
            greaterThan: BNComparer;
            gt: BNComparer;
            gte: BNComparer;
            below: BNComparer;
            lessThan: BNComparer;
            lt: BNComparer;
            lte: BNComparer;
            least: BNComparer;
            most: BNComparer;
            closeTo: BNCloseTo;
            negative: BNBoolean;
            zero: BNBoolean;
        }
        export interface Assertion {
            bignumber: BNAssertion;
        }
    }
}
