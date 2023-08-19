"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_fast_check_1 = require("jest-fast-check");
const abiSchema = __importStar(require("@truffle/contract-schema/spec/abi.spec.json"));
const jest_json_schema_1 = require("jest-json-schema");
expect.extend(jest_json_schema_1.matchers);
const Arbitrary = __importStar(require("./arbitrary"));
// helper function to ensure that, when we match against a given subschema,
// we also include all the definitions, in case the subschema references those
const withDefinitions = (schema) => (Object.assign({ definitions: abiSchema.definitions }, schema));
const arbitraries = {
    Parameter: {
        arbitrary: Arbitrary.Parameter(),
        schema: withDefinitions(abiSchema.definitions.Parameter)
    },
    EventParameter: {
        arbitrary: Arbitrary.EventParameter(),
        schema: withDefinitions(abiSchema.definitions.EventParameter)
    },
    EventEntry: {
        arbitrary: Arbitrary.EventEntry(),
        schema: withDefinitions(abiSchema.definitions.Event)
    },
    ErrorEntry: {
        arbitrary: Arbitrary.ErrorEntry(),
        schema: withDefinitions(abiSchema.definitions.Error)
    },
    FunctionEntry: {
        arbitrary: Arbitrary.FunctionEntry(),
        schema: withDefinitions(abiSchema.definitions.NormalFunction)
    },
    ConstructorEntry: {
        arbitrary: Arbitrary.ConstructorEntry(),
        schema: withDefinitions(abiSchema.definitions.ConstructorFunction)
    },
    ReceiveEntry: {
        arbitrary: Arbitrary.ReceiveEntry(),
        schema: withDefinitions(abiSchema.definitions.ReceiveFunction)
    },
    FallbackEntry: {
        arbitrary: Arbitrary.FallbackEntry(),
        schema: withDefinitions(abiSchema.definitions.FallbackFunction)
    },
    Abi: {
        arbitrary: Arbitrary.Abi(),
        schema: abiSchema
    }
};
for (const [name, { arbitrary, schema }] of Object.entries(arbitraries)) {
    describe(`Arbitrary.${name}`, () => {
        jest_fast_check_1.testProp("validates schema", [arbitrary], value => {
            expect(value).toMatchSchema(schema);
        });
    });
}
//# sourceMappingURL=arbitrary.test.js.map