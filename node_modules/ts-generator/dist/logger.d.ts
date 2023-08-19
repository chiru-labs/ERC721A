declare type TLoggerFunction = (...args: any[]) => void;
export declare type TLoggerLvl = "info" | "verbose" | "error";
export interface TLogger {
    info: TLoggerFunction;
    verbose: TLoggerFunction;
    error: TLoggerFunction;
    warn: TLoggerFunction;
    accent(s: string): string;
    childLogger(name: string): TLogger;
    lvl: TLoggerLvl;
}
export declare class ConsoleLogger implements TLogger {
    private name;
    lvl: TLoggerLvl;
    constructor(name: string, lvl: TLoggerLvl);
    private prefix;
    info(...args: any[]): void;
    verbose(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    accent(s: string): string;
    childLogger(name: string): TLogger;
}
export declare class NoLogger implements TLogger {
    lvl: TLoggerLvl;
    info(): void;
    verbose(): void;
    error(): void;
    warn(): void;
    accent(s: string): string;
    childLogger(): TLogger;
}
export {};
