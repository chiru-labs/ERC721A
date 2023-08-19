"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinHelper = exports.takeWhileHelper = exports.takeNHelper = exports.filterHelper = exports.flatMapHelper = exports.mapHelper = exports.nilHelper = void 0;
class Nil {
    [Symbol.iterator]() {
        return this;
    }
    next(value) {
        return { value, done: true };
    }
}
Nil.nil = new Nil();
function nilHelper() {
    return Nil.nil;
}
exports.nilHelper = nilHelper;
function* mapHelper(g, f) {
    for (const v of g) {
        yield f(v);
    }
}
exports.mapHelper = mapHelper;
function* flatMapHelper(g, f) {
    for (const v of g) {
        yield* f(v);
    }
}
exports.flatMapHelper = flatMapHelper;
function* filterHelper(g, f) {
    for (const v of g) {
        if (f(v)) {
            yield v;
        }
    }
}
exports.filterHelper = filterHelper;
function* takeNHelper(g, n) {
    for (let i = 0; i < n; ++i) {
        const cur = g.next();
        if (cur.done) {
            break;
        }
        yield cur.value;
    }
}
exports.takeNHelper = takeNHelper;
function* takeWhileHelper(g, f) {
    let cur = g.next();
    while (!cur.done && f(cur.value)) {
        yield cur.value;
        cur = g.next();
    }
}
exports.takeWhileHelper = takeWhileHelper;
function* joinHelper(g, others) {
    for (let cur = g.next(); !cur.done; cur = g.next()) {
        yield cur.value;
    }
    for (const s of others) {
        for (let cur = s.next(); !cur.done; cur = s.next()) {
            yield cur.value;
        }
    }
}
exports.joinHelper = joinHelper;
