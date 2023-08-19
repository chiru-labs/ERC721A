import { RunState } from './interpreter';
export interface SyncOpHandler {
    (runState: RunState): void;
}
export interface AsyncOpHandler {
    (runState: RunState): Promise<void>;
}
export declare type OpHandler = SyncOpHandler | AsyncOpHandler;
export declare const handlers: {
    [k: string]: OpHandler;
};
