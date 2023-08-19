/** Class representing a semaphore
 * Semaphores are initialized with a number of permits that get aquired and released
 * over the lifecycle of the Semaphore. These permits limit the number of simultaneous
 * executions of the code that the Semaphore synchronizes. Functions can wait and stop
 * executing until a permit becomes available.
 *
 * Locks that only allow one execution of a critical section are a special case of
 * Semaphores. To construct a lock, initialize a Semaphore with a permit count of 1.
 *
 * This Semaphore class is implemented with the help of promises that get returned
 * by functions that wait for permits to become available. This makes it possible
 * to use async/await to synchronize your code.
 */
export default class Semaphore {
    private permits;
    private promiseResolverQueue;
    /**
     * Creates a semaphore.
     * @param permits  The number of permits, i.e. things being allowed to run in parallel.
     * To create a lock that only lets one thing run at a time, set this to 1.
     * This number can also be negative.
     */
    constructor(permits: number);
    /**
     * Returns the number of available permits.
     * @returns  The number of available permits.
     */
    getPermits(): number;
    /**
     * Returns a promise used to wait for a permit to become available. This method should be awaited on.
     * @returns  A promise that gets resolved when execution is allowed to proceed.
     */
    wait(): Promise<boolean>;
    /**
     * Alias for {@linkcode Semaphore.wait}.
     * @returns  A promise that gets resolved when execution is allowed to proceed.
     */
    acquire(): Promise<boolean>;
    /**
     * Same as {@linkcode Semaphore.wait} except the promise returned gets resolved with false if no
     * permit becomes available in time.
     * @param milliseconds  The time spent waiting before the wait is aborted. This is a lower bound,
     * don't rely on it being precise.
     * @returns  A promise that gets resolved with true when execution is allowed to proceed or
     * false if the time given elapses before a permit becomes available.
     */
    waitFor(milliseconds: number): Promise<boolean>;
    /**
     * Synchronous function that tries to acquire a permit and returns true if successful, false otherwise.
     * @returns  Whether a permit could be acquired.
     */
    tryAcquire(): boolean;
    /**
     * Acquires all permits that are currently available and returns the number of acquired permits.
     * @returns  Number of acquired permits.
     */
    drainPermits(): number;
    /**
     * Increases the number of permits by one. If there are other functions waiting, one of them will
     * continue to execute in a future iteration of the event loop.
     */
    signal(): void;
    /**
     * Alias for {@linkcode Semaphore.signal}.
     */
    release(): void;
    /**
     * Schedules func to be called once a permit becomes available.
     * Returns a promise that resolves to the return value of func.
     * @typeparam T  The return type of func.
     * @param func  The function to be executed.
     * @return  A promise that gets resolved with the return value of the function.
     */
    execute<T>(func: () => T | PromiseLike<T>): Promise<T>;
}
