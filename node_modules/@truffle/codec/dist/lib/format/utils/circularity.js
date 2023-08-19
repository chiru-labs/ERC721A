"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tie = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:format:utils:circularity");
function tie(untied) {
    return tieWithTable(untied, []);
}
exports.tie = tie;
function tieWithTable(untied, seenSoFar) {
    if (untied.kind === "error") {
        return untied;
    }
    let reference;
    switch (untied.type.typeClass) {
        case "array":
            let untiedAsArray = untied; //dammit TS
            reference = untiedAsArray.reference;
            if (reference === undefined) {
                //we need to do some pointer stuff here, so let's first create our new
                //object we'll be pointing to
                //[we don't want to alter the original accidentally so let's clone a bit]
                let tied = Object.assign(Object.assign({}, untiedAsArray), { value: [...untiedAsArray.value] });
                //now, we can't use a map here, or we'll screw things up!
                //we want to *mutate* value, not replace it with a new object
                for (let index in tied.value) {
                    tied.value[index] = tieWithTable(tied.value[index], [
                        tied,
                        ...seenSoFar
                    ]);
                }
                return tied;
            }
            else {
                return Object.assign(Object.assign({}, seenSoFar[reference - 1]), { reference });
            }
        case "struct":
            let untiedAsStruct = untied; //dammit TS
            reference = untiedAsStruct.reference;
            if (reference === undefined) {
                //we need to do some pointer stuff here, so let's first create our new
                //object we'll be pointing to
                //[we don't want to alter the original accidentally so let's clone a bit]
                let tied = Object.assign(Object.assign({}, untiedAsStruct), { value: untiedAsStruct.value.map(component => (Object.assign({}, component))) });
                //now, we can't use a map here, or we'll screw things up!
                //we want to *mutate* value, not replace it with a new object
                for (let index in tied.value) {
                    tied.value[index] = Object.assign(Object.assign({}, tied.value[index]), { value: tieWithTable(tied.value[index].value, [tied, ...seenSoFar]) });
                }
                return tied;
            }
            else {
                return Object.assign(Object.assign({}, seenSoFar[reference - 1]), { reference });
            }
        case "tuple": //currently there are no memory tuples, but may as well
            //can't be circular, just recurse
            //note we can just recurse with a straight tie here; don't need tieWithTable
            let untiedAsTuple = untied; //dammit TS
            //we need to do some pointer stuff here, so let's first create our new
            //object we'll be pointing to
            let tied = Object.assign({}, untiedAsTuple);
            tied.value = tied.value.map(component => (Object.assign(Object.assign({}, component), { value: tie(component.value) })));
            return tied;
        default:
            //other types either:
            //1. aren't containers and so need no recursion
            //2. are containers but can't go in or contain memory things
            //and so still need no recursion
            //(or, in the case of mappings, can't contain *nontrivial* memory
            //things)
            return untied;
    }
}
//# sourceMappingURL=circularity.js.map