export class CustomEqualSet {
    constructor(isEqual) {
        this.isEqual = isEqual;
        this.data = [];
    }
    tryAdd(value) {
        for (let idx = 0; idx !== this.data.length; ++idx) {
            if (this.isEqual(this.data[idx], value)) {
                return false;
            }
        }
        this.data.push(value);
        return true;
    }
    size() {
        return this.data.length;
    }
    getData() {
        return this.data.slice();
    }
}
