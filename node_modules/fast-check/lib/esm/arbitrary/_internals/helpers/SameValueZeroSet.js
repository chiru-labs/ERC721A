export class SameValueZeroSet {
    constructor(selector) {
        this.selector = selector;
        this.selectedItems = new Set();
        this.data = [];
    }
    tryAdd(value) {
        const selected = this.selector(value);
        const sizeBefore = this.selectedItems.size;
        this.selectedItems.add(selected);
        if (sizeBefore !== this.selectedItems.size) {
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
