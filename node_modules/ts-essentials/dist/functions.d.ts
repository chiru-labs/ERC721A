import { Primitive } from "./types";
export declare class UnreachableCaseError extends Error {
    constructor(value: never);
}
export declare function literal<T extends Primitive>(value: T): T;
