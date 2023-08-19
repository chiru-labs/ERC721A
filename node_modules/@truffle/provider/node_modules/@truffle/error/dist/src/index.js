"use strict";
//Note: This class only exists for compatibility with some old Javascript
//stuff that avoided using Error directly for whatever reason.  Eventually
//it should be eliminated.
class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
module.exports = ExtendableError;
//# sourceMappingURL=index.js.map