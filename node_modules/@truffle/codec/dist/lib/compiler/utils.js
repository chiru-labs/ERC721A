"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solidityFamily = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:compiler:utils");
const semver_1 = __importDefault(require("semver"));
function solidityFamily(compiler) {
    if (!compiler || compiler.name !== "solc") {
        return "unknown";
    }
    if (semver_1.default.satisfies(compiler.version, ">=0.8.9", {
        includePrerelease: true
    })) {
        return "0.8.9+";
    }
    else if (semver_1.default.satisfies(compiler.version, ">=0.8.7", {
        includePrerelease: true
    })) {
        return "0.8.7+";
    }
    else if (
    //see comment below about the weird-looking condition
    semver_1.default.satisfies(compiler.version, "~0.8 || >=0.8.0", {
        includePrerelease: true
    })) {
        return "0.8.x";
    }
    else if (semver_1.default.satisfies(compiler.version, "~0.5 || >=0.5.0", {
        includePrerelease: true
    })) {
        //what's with this weird-looking condition?  Well, I want to be sure to include
        //prerelease versions of 0.5.0.  But isn't that what the includePrerelease option
        //does?  No!  That just makes it so that prerelease versions can be included at
        //all; without that, all prereleases of *any* version of Solidity can be excluded.
        //A prerelease version of 0.5.0 still wouldn't satisfy >=0.5.0, so I added in ~0.5
        //as well, which they do satisfy.
        return "0.5.x";
    }
    else {
        return "pre-0.5.0";
    }
}
exports.solidityFamily = solidityFamily;
//# sourceMappingURL=utils.js.map