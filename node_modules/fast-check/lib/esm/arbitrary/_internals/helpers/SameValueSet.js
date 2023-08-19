export class SameValueSet {
    constructor(selector) {
        this.selector = selector;
        this.selectedItemsExceptMinusZero = new Set();
        this.data = [];
        this.hasMinusZero = false;
    }
    tryAdd(value) {
        const selected = this.selector(value);
        if (Object.is(selected, -0)) {
            if (this.hasMinusZero) {
                return false;
            }
            this.data.push(value);
            this.hasMinusZero = true;
            return true;
        }
        const sizeBefore = this.selectedItemsExceptMinusZero.size;
        this.selectedItemsExceptMinusZero.add(selected);
        if (sizeBefore !== this.selectedItemsExceptMinusZero.size) {
            this.data.push(value);
            return true;
        }
        return false;
    }
    size() {
        return this.data.length;
    }
    getData() {
        return this.data;
    }
}
