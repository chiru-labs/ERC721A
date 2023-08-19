"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = require("path");
var assertNever_1 = require("../assertNever");
exports.executeEffects = function (effects, _a) {
    var dryRun = _a.dryRun;
    effects.forEach(function (eff) {
        switch (eff.type) {
            case "file deletion":
                if (dryRun) {
                    if (!fs_extra_1.default.existsSync(eff.path)) {
                        throw new Error("Trying to delete file that doesn't exist: " + eff.path);
                    }
                }
                else {
                    // TODO: integrity checks
                    fs_extra_1.default.unlinkSync(eff.path);
                }
                break;
            case "rename":
                if (dryRun) {
                    // TODO: see what patch files look like if moving to exising path
                    if (!fs_extra_1.default.existsSync(eff.fromPath)) {
                        throw new Error("Trying to move file that doesn't exist: " + eff.fromPath);
                    }
                }
                else {
                    fs_extra_1.default.moveSync(eff.fromPath, eff.toPath);
                }
                break;
            case "file creation":
                if (dryRun) {
                    if (fs_extra_1.default.existsSync(eff.path)) {
                        throw new Error("Trying to create file that already exists: " + eff.path);
                    }
                    // todo: check file contents matches
                }
                else {
                    var fileContents = eff.hunk
                        ? eff.hunk.parts[0].lines.join("\n") +
                            (eff.hunk.parts[0].noNewlineAtEndOfFile ? "" : "\n")
                        : "";
                    fs_extra_1.default.ensureDirSync(path_1.dirname(eff.path));
                    fs_extra_1.default.writeFileSync(eff.path, fileContents, { mode: eff.mode });
                }
                break;
            case "patch":
                applyPatch(eff, { dryRun: dryRun });
                break;
            case "mode change":
                var currentMode = fs_extra_1.default.statSync(eff.path).mode;
                if (((isExecutable(eff.newMode) && isExecutable(currentMode)) ||
                    (!isExecutable(eff.newMode) && !isExecutable(currentMode))) &&
                    dryRun) {
                    console.warn("Mode change is not required for file " + eff.path);
                }
                fs_extra_1.default.chmodSync(eff.path, eff.newMode);
                break;
            default:
                assertNever_1.assertNever(eff);
        }
    });
};
function isExecutable(fileMode) {
    // tslint:disable-next-line:no-bitwise
    return (fileMode & 64) > 0;
}
var trimRight = function (s) { return s.replace(/\s+$/, ""); };
function linesAreEqual(a, b) {
    return trimRight(a) === trimRight(b);
}
/**
 * How does noNewLineAtEndOfFile work?
 *
 * if you remove the newline from a file that had one without editing other bits:
 *
 *    it creates an insertion/removal pair where the insertion has \ No new line at end of file
 *
 * if you edit a file that didn't have a new line and don't add one:
 *
 *    both insertion and deletion have \ No new line at end of file
 *
 * if you edit a file that didn't have a new line and add one:
 *
 *    deletion has \ No new line at end of file
 *    but not insertion
 *
 * if you edit a file that had a new line and leave it in:
 *
 *    neither insetion nor deletion have the annoation
 *
 */
function applyPatch(_a, _b) {
    var hunks = _a.hunks, path = _a.path;
    var dryRun = _b.dryRun;
    // modifying the file in place
    var fileContents = fs_extra_1.default.readFileSync(path).toString();
    var mode = fs_extra_1.default.statSync(path).mode;
    var fileLines = fileContents.split(/\n/);
    var result = [];
    for (var _i = 0, hunks_1 = hunks; _i < hunks_1.length; _i++) {
        var hunk = hunks_1[_i];
        var fuzzingOffset = 0;
        while (true) {
            var modifications = evaluateHunk(hunk, fileLines, fuzzingOffset);
            if (modifications) {
                result.push(modifications);
                break;
            }
            fuzzingOffset =
                fuzzingOffset < 0 ? fuzzingOffset * -1 : fuzzingOffset * -1 - 1;
            if (Math.abs(fuzzingOffset) > 20) {
                throw new Error("Cant apply hunk " + hunks.indexOf(hunk) + " for file " + path);
            }
        }
    }
    if (dryRun) {
        return;
    }
    var diffOffset = 0;
    for (var _c = 0, result_1 = result; _c < result_1.length; _c++) {
        var modifications = result_1[_c];
        for (var _d = 0, modifications_1 = modifications; _d < modifications_1.length; _d++) {
            var modification = modifications_1[_d];
            switch (modification.type) {
                case "splice":
                    fileLines.splice.apply(fileLines, __spreadArrays([modification.index + diffOffset,
                        modification.numToDelete], modification.linesToInsert));
                    diffOffset +=
                        modification.linesToInsert.length - modification.numToDelete;
                    break;
                case "pop":
                    fileLines.pop();
                    break;
                case "push":
                    fileLines.push(modification.line);
                    break;
                default:
                    assertNever_1.assertNever(modification);
            }
        }
    }
    fs_extra_1.default.writeFileSync(path, fileLines.join("\n"), { mode: mode });
}
function evaluateHunk(hunk, fileLines, fuzzingOffset) {
    var result = [];
    var contextIndex = hunk.header.original.start - 1 + fuzzingOffset;
    // do bounds checks for index
    if (contextIndex < 0) {
        return null;
    }
    if (fileLines.length - contextIndex < hunk.header.original.length) {
        return null;
    }
    for (var _i = 0, _a = hunk.parts; _i < _a.length; _i++) {
        var part = _a[_i];
        switch (part.type) {
            case "deletion":
            case "context":
                for (var _b = 0, _c = part.lines; _b < _c.length; _b++) {
                    var line = _c[_b];
                    var originalLine = fileLines[contextIndex];
                    if (!linesAreEqual(originalLine, line)) {
                        return null;
                    }
                    contextIndex++;
                }
                if (part.type === "deletion") {
                    result.push({
                        type: "splice",
                        index: contextIndex - part.lines.length,
                        numToDelete: part.lines.length,
                        linesToInsert: [],
                    });
                    if (part.noNewlineAtEndOfFile) {
                        result.push({
                            type: "push",
                            line: "",
                        });
                    }
                }
                break;
            case "insertion":
                result.push({
                    type: "splice",
                    index: contextIndex,
                    numToDelete: 0,
                    linesToInsert: part.lines,
                });
                if (part.noNewlineAtEndOfFile) {
                    result.push({ type: "pop" });
                }
                break;
            default:
                assertNever_1.assertNever(part.type);
        }
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGF0Y2gvYXBwbHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsc0RBQXlCO0FBQ3pCLDZCQUE4QjtBQUU5Qiw4Q0FBNEM7QUFFL0IsUUFBQSxjQUFjLEdBQUcsVUFDNUIsT0FBd0IsRUFDeEIsRUFBK0I7UUFBN0Isa0JBQU07SUFFUixPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztRQUNqQixRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDaEIsS0FBSyxlQUFlO2dCQUNsQixJQUFJLE1BQU0sRUFBRTtvQkFDVixJQUFJLENBQUMsa0JBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUM1QixNQUFNLElBQUksS0FBSyxDQUNiLDRDQUE0QyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQ3hELENBQUE7cUJBQ0Y7aUJBQ0Y7cUJBQU07b0JBQ0wseUJBQXlCO29CQUN6QixrQkFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7aUJBQ3hCO2dCQUNELE1BQUs7WUFDUCxLQUFLLFFBQVE7Z0JBQ1gsSUFBSSxNQUFNLEVBQUU7b0JBQ1YsaUVBQWlFO29CQUNqRSxJQUFJLENBQUMsa0JBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUNiLDBDQUEwQyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQzFELENBQUE7cUJBQ0Y7aUJBQ0Y7cUJBQU07b0JBQ0wsa0JBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7aUJBQ3RDO2dCQUNELE1BQUs7WUFDUCxLQUFLLGVBQWU7Z0JBQ2xCLElBQUksTUFBTSxFQUFFO29CQUNWLElBQUksa0JBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUMzQixNQUFNLElBQUksS0FBSyxDQUNiLDZDQUE2QyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQ3pELENBQUE7cUJBQ0Y7b0JBQ0Qsb0NBQW9DO2lCQUNyQztxQkFBTTtvQkFDTCxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsSUFBSTt3QkFDM0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzRCQUNsQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzt3QkFDdEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtvQkFDTixrQkFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7b0JBQ25DLGtCQUFFLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO2lCQUM3RDtnQkFDRCxNQUFLO1lBQ1AsS0FBSyxPQUFPO2dCQUNWLFVBQVUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxNQUFNLFFBQUEsRUFBRSxDQUFDLENBQUE7Z0JBQzNCLE1BQUs7WUFDUCxLQUFLLGFBQWE7Z0JBQ2hCLElBQU0sV0FBVyxHQUFHLGtCQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUE7Z0JBQzlDLElBQ0UsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUN2RCxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUM3RCxNQUFNLEVBQ047b0JBQ0EsT0FBTyxDQUFDLElBQUksQ0FBQywwQ0FBd0MsR0FBRyxDQUFDLElBQU0sQ0FBQyxDQUFBO2lCQUNqRTtnQkFDRCxrQkFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtnQkFDbkMsTUFBSztZQUNQO2dCQUNFLHlCQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDbkI7SUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQTtBQUVELFNBQVMsWUFBWSxDQUFDLFFBQWdCO0lBQ3BDLHNDQUFzQztJQUN0QyxPQUFPLENBQUMsUUFBUSxHQUFHLEVBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN2QyxDQUFDO0FBRUQsSUFBTSxTQUFTLEdBQUcsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBckIsQ0FBcUIsQ0FBQTtBQUN0RCxTQUFTLGFBQWEsQ0FBQyxDQUFTLEVBQUUsQ0FBUztJQUN6QyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdEMsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUVILFNBQVMsVUFBVSxDQUNqQixFQUEwQixFQUMxQixFQUErQjtRQUQ3QixnQkFBSyxFQUFFLGNBQUk7UUFDWCxrQkFBTTtJQUVSLDhCQUE4QjtJQUM5QixJQUFNLFlBQVksR0FBRyxrQkFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUNyRCxJQUFNLElBQUksR0FBRyxrQkFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFFbkMsSUFBTSxTQUFTLEdBQWEsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUVwRCxJQUFNLE1BQU0sR0FBcUIsRUFBRSxDQUFBO0lBRW5DLEtBQW1CLFVBQUssRUFBTCxlQUFLLEVBQUwsbUJBQUssRUFBTCxJQUFLLEVBQUU7UUFBckIsSUFBTSxJQUFJLGNBQUE7UUFDYixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUE7UUFDckIsT0FBTyxJQUFJLEVBQUU7WUFDWCxJQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQTtZQUNsRSxJQUFJLGFBQWEsRUFBRTtnQkFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtnQkFDMUIsTUFBSzthQUNOO1lBRUQsYUFBYTtnQkFDWCxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFFakUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FDYixxQkFBbUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWEsSUFBTSxDQUMxRCxDQUFBO2FBQ0Y7U0FDRjtLQUNGO0lBRUQsSUFBSSxNQUFNLEVBQUU7UUFDVixPQUFNO0tBQ1A7SUFFRCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUE7SUFFbEIsS0FBNEIsVUFBTSxFQUFOLGlCQUFNLEVBQU4sb0JBQU0sRUFBTixJQUFNLEVBQUU7UUFBL0IsSUFBTSxhQUFhLGVBQUE7UUFDdEIsS0FBMkIsVUFBYSxFQUFiLCtCQUFhLEVBQWIsMkJBQWEsRUFBYixJQUFhLEVBQUU7WUFBckMsSUFBTSxZQUFZLHNCQUFBO1lBQ3JCLFFBQVEsWUFBWSxDQUFDLElBQUksRUFBRTtnQkFDekIsS0FBSyxRQUFRO29CQUNYLFNBQVMsQ0FBQyxNQUFNLE9BQWhCLFNBQVMsa0JBQ1AsWUFBWSxDQUFDLEtBQUssR0FBRyxVQUFVO3dCQUMvQixZQUFZLENBQUMsV0FBVyxHQUNyQixZQUFZLENBQUMsYUFBYSxHQUM5QjtvQkFDRCxVQUFVO3dCQUNSLFlBQVksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUE7b0JBQzlELE1BQUs7Z0JBQ1AsS0FBSyxLQUFLO29CQUNSLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtvQkFDZixNQUFLO2dCQUNQLEtBQUssTUFBTTtvQkFDVCxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtvQkFDakMsTUFBSztnQkFDUDtvQkFDRSx5QkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFBO2FBQzVCO1NBQ0Y7S0FDRjtJQUVELGtCQUFFLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQyxDQUFBO0FBQ3hELENBQUM7QUFrQkQsU0FBUyxZQUFZLENBQ25CLElBQVUsRUFDVixTQUFtQixFQUNuQixhQUFxQjtJQUVyQixJQUFNLE1BQU0sR0FBbUIsRUFBRSxDQUFBO0lBQ2pDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFBO0lBQ2pFLDZCQUE2QjtJQUM3QixJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7UUFDcEIsT0FBTyxJQUFJLENBQUE7S0FDWjtJQUNELElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ2pFLE9BQU8sSUFBSSxDQUFBO0tBQ1o7SUFFRCxLQUFtQixVQUFVLEVBQVYsS0FBQSxJQUFJLENBQUMsS0FBSyxFQUFWLGNBQVUsRUFBVixJQUFVLEVBQUU7UUFBMUIsSUFBTSxJQUFJLFNBQUE7UUFDYixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDakIsS0FBSyxVQUFVLENBQUM7WUFDaEIsS0FBSyxTQUFTO2dCQUNaLEtBQW1CLFVBQVUsRUFBVixLQUFBLElBQUksQ0FBQyxLQUFLLEVBQVYsY0FBVSxFQUFWLElBQVUsRUFBRTtvQkFBMUIsSUFBTSxJQUFJLFNBQUE7b0JBQ2IsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFBO29CQUM1QyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFDdEMsT0FBTyxJQUFJLENBQUE7cUJBQ1o7b0JBQ0QsWUFBWSxFQUFFLENBQUE7aUJBQ2Y7Z0JBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtvQkFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQzt3QkFDVixJQUFJLEVBQUUsUUFBUTt3QkFDZCxLQUFLLEVBQUUsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTt3QkFDdkMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTt3QkFDOUIsYUFBYSxFQUFFLEVBQUU7cUJBQ2xCLENBQUMsQ0FBQTtvQkFFRixJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTt3QkFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQzs0QkFDVixJQUFJLEVBQUUsTUFBTTs0QkFDWixJQUFJLEVBQUUsRUFBRTt5QkFDVCxDQUFDLENBQUE7cUJBQ0g7aUJBQ0Y7Z0JBQ0QsTUFBSztZQUNQLEtBQUssV0FBVztnQkFDZCxNQUFNLENBQUMsSUFBSSxDQUFDO29CQUNWLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxZQUFZO29CQUNuQixXQUFXLEVBQUUsQ0FBQztvQkFDZCxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUs7aUJBQzFCLENBQUMsQ0FBQTtnQkFDRixJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtvQkFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO2lCQUM3QjtnQkFDRCxNQUFLO1lBQ1A7Z0JBQ0UseUJBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDekI7S0FDRjtJQUVELE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIlxuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gXCJwYXRoXCJcbmltcG9ydCB7IFBhcnNlZFBhdGNoRmlsZSwgRmlsZVBhdGNoLCBIdW5rIH0gZnJvbSBcIi4vcGFyc2VcIlxuaW1wb3J0IHsgYXNzZXJ0TmV2ZXIgfSBmcm9tIFwiLi4vYXNzZXJ0TmV2ZXJcIlxuXG5leHBvcnQgY29uc3QgZXhlY3V0ZUVmZmVjdHMgPSAoXG4gIGVmZmVjdHM6IFBhcnNlZFBhdGNoRmlsZSxcbiAgeyBkcnlSdW4gfTogeyBkcnlSdW46IGJvb2xlYW4gfSxcbikgPT4ge1xuICBlZmZlY3RzLmZvckVhY2goZWZmID0+IHtcbiAgICBzd2l0Y2ggKGVmZi50eXBlKSB7XG4gICAgICBjYXNlIFwiZmlsZSBkZWxldGlvblwiOlxuICAgICAgICBpZiAoZHJ5UnVuKSB7XG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGVmZi5wYXRoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcIlRyeWluZyB0byBkZWxldGUgZmlsZSB0aGF0IGRvZXNuJ3QgZXhpc3Q6IFwiICsgZWZmLnBhdGgsXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRPRE86IGludGVncml0eSBjaGVja3NcbiAgICAgICAgICBmcy51bmxpbmtTeW5jKGVmZi5wYXRoKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwicmVuYW1lXCI6XG4gICAgICAgIGlmIChkcnlSdW4pIHtcbiAgICAgICAgICAvLyBUT0RPOiBzZWUgd2hhdCBwYXRjaCBmaWxlcyBsb29rIGxpa2UgaWYgbW92aW5nIHRvIGV4aXNpbmcgcGF0aFxuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhlZmYuZnJvbVBhdGgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIFwiVHJ5aW5nIHRvIG1vdmUgZmlsZSB0aGF0IGRvZXNuJ3QgZXhpc3Q6IFwiICsgZWZmLmZyb21QYXRoLFxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcy5tb3ZlU3luYyhlZmYuZnJvbVBhdGgsIGVmZi50b1BhdGgpXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJmaWxlIGNyZWF0aW9uXCI6XG4gICAgICAgIGlmIChkcnlSdW4pIHtcbiAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhlZmYucGF0aCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgXCJUcnlpbmcgdG8gY3JlYXRlIGZpbGUgdGhhdCBhbHJlYWR5IGV4aXN0czogXCIgKyBlZmYucGF0aCxcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gdG9kbzogY2hlY2sgZmlsZSBjb250ZW50cyBtYXRjaGVzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnRzID0gZWZmLmh1bmtcbiAgICAgICAgICAgID8gZWZmLmh1bmsucGFydHNbMF0ubGluZXMuam9pbihcIlxcblwiKSArXG4gICAgICAgICAgICAgIChlZmYuaHVuay5wYXJ0c1swXS5ub05ld2xpbmVBdEVuZE9mRmlsZSA/IFwiXCIgOiBcIlxcblwiKVxuICAgICAgICAgICAgOiBcIlwiXG4gICAgICAgICAgZnMuZW5zdXJlRGlyU3luYyhkaXJuYW1lKGVmZi5wYXRoKSlcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGVmZi5wYXRoLCBmaWxlQ29udGVudHMsIHsgbW9kZTogZWZmLm1vZGUgfSlcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcInBhdGNoXCI6XG4gICAgICAgIGFwcGx5UGF0Y2goZWZmLCB7IGRyeVJ1biB9KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcIm1vZGUgY2hhbmdlXCI6XG4gICAgICAgIGNvbnN0IGN1cnJlbnRNb2RlID0gZnMuc3RhdFN5bmMoZWZmLnBhdGgpLm1vZGVcbiAgICAgICAgaWYgKFxuICAgICAgICAgICgoaXNFeGVjdXRhYmxlKGVmZi5uZXdNb2RlKSAmJiBpc0V4ZWN1dGFibGUoY3VycmVudE1vZGUpKSB8fFxuICAgICAgICAgICAgKCFpc0V4ZWN1dGFibGUoZWZmLm5ld01vZGUpICYmICFpc0V4ZWN1dGFibGUoY3VycmVudE1vZGUpKSkgJiZcbiAgICAgICAgICBkcnlSdW5cbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBNb2RlIGNoYW5nZSBpcyBub3QgcmVxdWlyZWQgZm9yIGZpbGUgJHtlZmYucGF0aH1gKVxuICAgICAgICB9XG4gICAgICAgIGZzLmNobW9kU3luYyhlZmYucGF0aCwgZWZmLm5ld01vZGUpXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhc3NlcnROZXZlcihlZmYpXG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiBpc0V4ZWN1dGFibGUoZmlsZU1vZGU6IG51bWJlcikge1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYml0d2lzZVxuICByZXR1cm4gKGZpbGVNb2RlICYgMGIwMDFfMDAwXzAwMCkgPiAwXG59XG5cbmNvbnN0IHRyaW1SaWdodCA9IChzOiBzdHJpbmcpID0+IHMucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxuZnVuY3Rpb24gbGluZXNBcmVFcXVhbChhOiBzdHJpbmcsIGI6IHN0cmluZykge1xuICByZXR1cm4gdHJpbVJpZ2h0KGEpID09PSB0cmltUmlnaHQoYilcbn1cblxuLyoqXG4gKiBIb3cgZG9lcyBub05ld0xpbmVBdEVuZE9mRmlsZSB3b3JrP1xuICpcbiAqIGlmIHlvdSByZW1vdmUgdGhlIG5ld2xpbmUgZnJvbSBhIGZpbGUgdGhhdCBoYWQgb25lIHdpdGhvdXQgZWRpdGluZyBvdGhlciBiaXRzOlxuICpcbiAqICAgIGl0IGNyZWF0ZXMgYW4gaW5zZXJ0aW9uL3JlbW92YWwgcGFpciB3aGVyZSB0aGUgaW5zZXJ0aW9uIGhhcyBcXCBObyBuZXcgbGluZSBhdCBlbmQgb2YgZmlsZVxuICpcbiAqIGlmIHlvdSBlZGl0IGEgZmlsZSB0aGF0IGRpZG4ndCBoYXZlIGEgbmV3IGxpbmUgYW5kIGRvbid0IGFkZCBvbmU6XG4gKlxuICogICAgYm90aCBpbnNlcnRpb24gYW5kIGRlbGV0aW9uIGhhdmUgXFwgTm8gbmV3IGxpbmUgYXQgZW5kIG9mIGZpbGVcbiAqXG4gKiBpZiB5b3UgZWRpdCBhIGZpbGUgdGhhdCBkaWRuJ3QgaGF2ZSBhIG5ldyBsaW5lIGFuZCBhZGQgb25lOlxuICpcbiAqICAgIGRlbGV0aW9uIGhhcyBcXCBObyBuZXcgbGluZSBhdCBlbmQgb2YgZmlsZVxuICogICAgYnV0IG5vdCBpbnNlcnRpb25cbiAqXG4gKiBpZiB5b3UgZWRpdCBhIGZpbGUgdGhhdCBoYWQgYSBuZXcgbGluZSBhbmQgbGVhdmUgaXQgaW46XG4gKlxuICogICAgbmVpdGhlciBpbnNldGlvbiBub3IgZGVsZXRpb24gaGF2ZSB0aGUgYW5ub2F0aW9uXG4gKlxuICovXG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2goXG4gIHsgaHVua3MsIHBhdGggfTogRmlsZVBhdGNoLFxuICB7IGRyeVJ1biB9OiB7IGRyeVJ1bjogYm9vbGVhbiB9LFxuKTogdm9pZCB7XG4gIC8vIG1vZGlmeWluZyB0aGUgZmlsZSBpbiBwbGFjZVxuICBjb25zdCBmaWxlQ29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxuICBjb25zdCBtb2RlID0gZnMuc3RhdFN5bmMocGF0aCkubW9kZVxuXG4gIGNvbnN0IGZpbGVMaW5lczogc3RyaW5nW10gPSBmaWxlQ29udGVudHMuc3BsaXQoL1xcbi8pXG5cbiAgY29uc3QgcmVzdWx0OiBNb2RpZmljYWl0b25bXVtdID0gW11cblxuICBmb3IgKGNvbnN0IGh1bmsgb2YgaHVua3MpIHtcbiAgICBsZXQgZnV6emluZ09mZnNldCA9IDBcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3QgbW9kaWZpY2F0aW9ucyA9IGV2YWx1YXRlSHVuayhodW5rLCBmaWxlTGluZXMsIGZ1enppbmdPZmZzZXQpXG4gICAgICBpZiAobW9kaWZpY2F0aW9ucykge1xuICAgICAgICByZXN1bHQucHVzaChtb2RpZmljYXRpb25zKVxuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBmdXp6aW5nT2Zmc2V0ID1cbiAgICAgICAgZnV6emluZ09mZnNldCA8IDAgPyBmdXp6aW5nT2Zmc2V0ICogLTEgOiBmdXp6aW5nT2Zmc2V0ICogLTEgLSAxXG5cbiAgICAgIGlmIChNYXRoLmFicyhmdXp6aW5nT2Zmc2V0KSA+IDIwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQ2FudCBhcHBseSBodW5rICR7aHVua3MuaW5kZXhPZihodW5rKX0gZm9yIGZpbGUgJHtwYXRofWAsXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoZHJ5UnVuKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBsZXQgZGlmZk9mZnNldCA9IDBcblxuICBmb3IgKGNvbnN0IG1vZGlmaWNhdGlvbnMgb2YgcmVzdWx0KSB7XG4gICAgZm9yIChjb25zdCBtb2RpZmljYXRpb24gb2YgbW9kaWZpY2F0aW9ucykge1xuICAgICAgc3dpdGNoIChtb2RpZmljYXRpb24udHlwZSkge1xuICAgICAgICBjYXNlIFwic3BsaWNlXCI6XG4gICAgICAgICAgZmlsZUxpbmVzLnNwbGljZShcbiAgICAgICAgICAgIG1vZGlmaWNhdGlvbi5pbmRleCArIGRpZmZPZmZzZXQsXG4gICAgICAgICAgICBtb2RpZmljYXRpb24ubnVtVG9EZWxldGUsXG4gICAgICAgICAgICAuLi5tb2RpZmljYXRpb24ubGluZXNUb0luc2VydCxcbiAgICAgICAgICApXG4gICAgICAgICAgZGlmZk9mZnNldCArPVxuICAgICAgICAgICAgbW9kaWZpY2F0aW9uLmxpbmVzVG9JbnNlcnQubGVuZ3RoIC0gbW9kaWZpY2F0aW9uLm51bVRvRGVsZXRlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcInBvcFwiOlxuICAgICAgICAgIGZpbGVMaW5lcy5wb3AoKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJwdXNoXCI6XG4gICAgICAgICAgZmlsZUxpbmVzLnB1c2gobW9kaWZpY2F0aW9uLmxpbmUpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBhc3NlcnROZXZlcihtb2RpZmljYXRpb24pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnMud3JpdGVGaWxlU3luYyhwYXRoLCBmaWxlTGluZXMuam9pbihcIlxcblwiKSwgeyBtb2RlIH0pXG59XG5cbmludGVyZmFjZSBQdXNoIHtcbiAgdHlwZTogXCJwdXNoXCJcbiAgbGluZTogc3RyaW5nXG59XG5pbnRlcmZhY2UgUG9wIHtcbiAgdHlwZTogXCJwb3BcIlxufVxuaW50ZXJmYWNlIFNwbGljZSB7XG4gIHR5cGU6IFwic3BsaWNlXCJcbiAgaW5kZXg6IG51bWJlclxuICBudW1Ub0RlbGV0ZTogbnVtYmVyXG4gIGxpbmVzVG9JbnNlcnQ6IHN0cmluZ1tdXG59XG5cbnR5cGUgTW9kaWZpY2FpdG9uID0gUHVzaCB8IFBvcCB8IFNwbGljZVxuXG5mdW5jdGlvbiBldmFsdWF0ZUh1bmsoXG4gIGh1bms6IEh1bmssXG4gIGZpbGVMaW5lczogc3RyaW5nW10sXG4gIGZ1enppbmdPZmZzZXQ6IG51bWJlcixcbik6IE1vZGlmaWNhaXRvbltdIHwgbnVsbCB7XG4gIGNvbnN0IHJlc3VsdDogTW9kaWZpY2FpdG9uW10gPSBbXVxuICBsZXQgY29udGV4dEluZGV4ID0gaHVuay5oZWFkZXIub3JpZ2luYWwuc3RhcnQgLSAxICsgZnV6emluZ09mZnNldFxuICAvLyBkbyBib3VuZHMgY2hlY2tzIGZvciBpbmRleFxuICBpZiAoY29udGV4dEluZGV4IDwgMCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKGZpbGVMaW5lcy5sZW5ndGggLSBjb250ZXh0SW5kZXggPCBodW5rLmhlYWRlci5vcmlnaW5hbC5sZW5ndGgpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGh1bmsucGFydHMpIHtcbiAgICBzd2l0Y2ggKHBhcnQudHlwZSkge1xuICAgICAgY2FzZSBcImRlbGV0aW9uXCI6XG4gICAgICBjYXNlIFwiY29udGV4dFwiOlxuICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgcGFydC5saW5lcykge1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTGluZSA9IGZpbGVMaW5lc1tjb250ZXh0SW5kZXhdXG4gICAgICAgICAgaWYgKCFsaW5lc0FyZUVxdWFsKG9yaWdpbmFsTGluZSwgbGluZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRleHRJbmRleCsrXG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFydC50eXBlID09PSBcImRlbGV0aW9uXCIpIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiBcInNwbGljZVwiLFxuICAgICAgICAgICAgaW5kZXg6IGNvbnRleHRJbmRleCAtIHBhcnQubGluZXMubGVuZ3RoLFxuICAgICAgICAgICAgbnVtVG9EZWxldGU6IHBhcnQubGluZXMubGVuZ3RoLFxuICAgICAgICAgICAgbGluZXNUb0luc2VydDogW10sXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGlmIChwYXJ0Lm5vTmV3bGluZUF0RW5kT2ZGaWxlKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgIHR5cGU6IFwicHVzaFwiLFxuICAgICAgICAgICAgICBsaW5lOiBcIlwiLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJpbnNlcnRpb25cIjpcbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwic3BsaWNlXCIsXG4gICAgICAgICAgaW5kZXg6IGNvbnRleHRJbmRleCxcbiAgICAgICAgICBudW1Ub0RlbGV0ZTogMCxcbiAgICAgICAgICBsaW5lc1RvSW5zZXJ0OiBwYXJ0LmxpbmVzLFxuICAgICAgICB9KVxuICAgICAgICBpZiAocGFydC5ub05ld2xpbmVBdEVuZE9mRmlsZSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHsgdHlwZTogXCJwb3BcIiB9KVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhc3NlcnROZXZlcihwYXJ0LnR5cGUpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuIl19