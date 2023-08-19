import { RandomGenerator } from '../generator/RandomGenerator';
export declare type Distribution<T> = (rng: RandomGenerator) => [T, RandomGenerator];
