import { ConverterFromNextProperty } from './ConverterFromNextProperty.js';
import { ConverterToNextProperty } from './ConverterToNextProperty.js';
export function convertFromNextProperty(property) {
    if (ConverterToNextProperty.isConverterToNext(property)) {
        return property.property;
    }
    return new ConverterFromNextProperty(property);
}
export function convertToNextProperty(property) {
    if (ConverterFromNextProperty.isConverterFromNext(property)) {
        return property.property;
    }
    return new ConverterToNextProperty(property);
}
export function convertFromNextPropertyWithHooks(property) {
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
export function convertFromNextAsyncPropertyWithHooks(property) {
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
