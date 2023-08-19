"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
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
var Semaphore = (function () {
    /**
     * Creates a semaphore.
     * @param permits  The number of permits, i.e. things being allowed to run in parallel.
     * To create a lock that only lets one thing run at a time, set this to 1.
     * This number can also be negative.
     */
    function Semaphore(permits) {
        this.promiseResolverQueue = [];
        this.permits = permits;
    }
    /**
     * Returns the number of available permits.
     * @returns  The number of available permits.
     */
    Semaphore.prototype.getPermits = function () {
        return this.permits;
    };
    /**
     * Returns a promise used to wait for a permit to become available. This method should be awaited on.
     * @returns  A promise that gets resolved when execution is allowed to proceed.
     */
    Semaphore.prototype.wait = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.permits > 0) {
                    this.permits -= 1;
                    return [2 /*return*/, Promise.resolve(true)];
                }
                // If there is no permit available, we return a promise that resolves once the semaphore gets
                // signaled enough times that permits is equal to one.
                return [2 /*return*/, new Promise(function (resolver) { return _this.promiseResolverQueue.push(resolver); })];
            });
        });
    };
    /**
     * Alias for {@linkcode Semaphore.wait}.
     * @returns  A promise that gets resolved when execution is allowed to proceed.
     */
    Semaphore.prototype.acquire = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.wait()];
            });
        });
    };
    /**
     * Same as {@linkcode Semaphore.wait} except the promise returned gets resolved with false if no
     * permit becomes available in time.
     * @param milliseconds  The time spent waiting before the wait is aborted. This is a lower bound,
     * don't rely on it being precise.
     * @returns  A promise that gets resolved with true when execution is allowed to proceed or
     * false if the time given elapses before a permit becomes available.
     */
    Semaphore.prototype.waitFor = function (milliseconds) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var resolver, promise;
            return __generator(this, function (_a) {
                if (this.permits > 0) {
                    this.permits -= 1;
                    return [2 /*return*/, Promise.resolve(true)];
                }
                resolver = function (b) { return void (0); };
                promise = new Promise(function (r) {
                    resolver = r;
                });
                // The saved resolver gets added to our list of promise resolvers so that it gets a chance
                // to be resolved as a result of a call to signal().
                this.promiseResolverQueue.push(resolver);
                setTimeout(function () {
                    // We have to remove the promise resolver from our list. Resolving it twice would not be
                    // an issue but signal() always takes the next resolver from the queue and resolves it which
                    // would swallow a permit if we didn't remove it.
                    var index = _this.promiseResolverQueue.indexOf(resolver);
                    if (index !== -1) {
                        _this.promiseResolverQueue.splice(index, 1);
                    }
                    else {
                        // This is weird... TODO Think about what the best course of action would be at this point.
                        // Probably do nothing.
                    }
                    // false because the wait was unsuccessful.
                    resolver(false);
                }, milliseconds);
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Synchronous function that tries to acquire a permit and returns true if successful, false otherwise.
     * @returns  Whether a permit could be acquired.
     */
    Semaphore.prototype.tryAcquire = function () {
        if (this.permits > 0) {
            this.permits -= 1;
            return true;
        }
        return false;
    };
    /**
     * Acquires all permits that are currently available and returns the number of acquired permits.
     * @returns  Number of acquired permits.
     */
    Semaphore.prototype.drainPermits = function () {
        if (this.permits > 0) {
            var permitCount = this.permits;
            this.permits = 0;
            return permitCount;
        }
        return 0;
    };
    /**
     * Increases the number of permits by one. If there are other functions waiting, one of them will
     * continue to execute in a future iteration of the event loop.
     */
    Semaphore.prototype.signal = function () {
        this.permits += 1;
        if (this.permits > 1 && this.promiseResolverQueue.length > 0) {
            throw new Error('this.permits should never be > 0 when there is someone waiting.');
        }
        else if (this.permits === 1 && this.promiseResolverQueue.length > 0) {
            // If there is someone else waiting, immediately consume the permit that was released
            // at the beginning of this function and let the waiting function resume.
            this.permits -= 1;
            var nextResolver = this.promiseResolverQueue.shift();
            if (nextResolver) {
                nextResolver(true);
            }
        }
    };
    /**
     * Alias for {@linkcode Semaphore.signal}.
     */
    Semaphore.prototype.release = function () {
        this.signal();
    };
    /**
     * Schedules func to be called once a permit becomes available.
     * Returns a promise that resolves to the return value of func.
     * @typeparam T  The return type of func.
     * @param func  The function to be executed.
     * @return  A promise that gets resolved with the return value of the function.
     */
    Semaphore.prototype.execute = function (func) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.wait()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, func()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        this.signal();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return Semaphore;
}());
exports["default"] = Semaphore;
