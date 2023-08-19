"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFromNextAsyncPropertyWithHooks = exports.convertFromNextPropertyWithHooks = exports.convertToNextProperty = exports.convertFromNextProperty = void 0;
const ConverterFromNextProperty_1 = require("./ConverterFromNextProperty");
const ConverterToNextProperty_1 = require("./ConverterToNextProperty");
function convertFromNextProperty(property) {
    if (ConverterToNextProperty_1.ConverterToNextProperty.isConverterToNext(property)) {
        return property.property;
    }
    return new ConverterFromNextProperty_1.ConverterFromNextProperty(property);
}
exports.convertFromNextProperty = convertFromNextProperty;
function convertToNextProperty(property) {
    if (ConverterFromNextProperty_1.ConverterFromNextProperty.isConverterFromNext(property)) {
        return property.property;
    }
    return new ConverterToNextProperty_1.ConverterToNextProperty(property);
}
exports.convertToNextProperty = convertToNextProperty;
function convertFromNextPropertyWithHooks(property) {
    const oldProperty = convertFromNextProperty(property);
    const hooks = {
        beforeEach(hookFunction) {
            property.beforeEach(hookFunction);
            return oldProperty;
        },
        afterEach(hookFunction) {
            property.afterEach(hookFunction);
            return oldProperty;
        },
    };
    return Object.assign(oldProperty, hooks);
}
exports.convertFromNextPropertyWithHooks = convertFromNextPropertyWithHooks;
function convertFromNextAsyncPropertyWithHooks(property) {
    const oldProperty = convertFromNextProperty(property);
    const hooks = {
        beforeEach(hookFunction) {
            property.beforeEach(hookFunction);
            return oldProperty;
        },
        afterEach(hookFunction) {
            property.afterEach(hookFunction);
            return oldProperty;
        },
    };
    return Object.assign(oldProperty, hooks);
}
exports.convertFromNextAsyncPropertyWithHooks = convertFromNextAsyncPropertyWithHooks;
