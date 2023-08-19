export class StrictlyEqualSet {
    constructor(selector) {
        this.selector = selector;
        this.selectedItemsExceptNaN = new Set();
        this.data = [];
    }
    tryAdd(value) {
        const selected = this.selector(value);
        if (Number.isNaN(selected)) {
            this.data.push(value);
            return true;
        }
        const sizeBefore = this.selectedItemsExceptNaN.size;
        this.selectedItemsExceptNaN.add(selected);
        if (sizeBefore !== this.selectedItemsExceptNaN.size) {
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
