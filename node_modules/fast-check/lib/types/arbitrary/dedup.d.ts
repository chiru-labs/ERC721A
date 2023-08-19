import { clone, CloneValue } from './clone';
/**
 * @deprecated Switch to {@link CloneValue} instead
 * @remarks Since 2.2.0
 * @public
 */
export declare type DedupValue<T, N extends number> = CloneValue<T, N>;
/**
 * @deprecated Switch to {@link clone} instead
 * @remarks Since 1.11.0
 * @public
 */
export declare const dedup: typeof clone;
