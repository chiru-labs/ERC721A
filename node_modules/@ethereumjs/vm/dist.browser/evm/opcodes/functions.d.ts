import Common from '@ethereumjs/common';
import { RunState } from './../interpreter';
export interface SyncOpHandler {
    (runState: RunState, common: Common): void;
}
export interface AsyncOpHandler {
    (runState: RunState, common: Common): Promise<void>;
}
export declare type OpHandler = SyncOpHandler | AsyncOpHandler;
export declare const handlers: Map<number, OpHandler>;
