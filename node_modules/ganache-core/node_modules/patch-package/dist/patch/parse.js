"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assertNever_1 = require("../assertNever");
exports.parseHunkHeaderLine = function (headerLine) {
    var match = headerLine
        .trim()
        .match(/^@@ -(\d+)(,(\d+))? \+(\d+)(,(\d+))? @@.*/);
    if (!match) {
        throw new Error("Bad header line: '" + headerLine + "'");
    }
    return {
        original: {
            start: Math.max(Number(match[1]), 1),
            length: Number(match[3] || 1),
        },
        patched: {
            start: Math.max(Number(match[4]), 1),
            length: Number(match[6] || 1),
        },
    };
};
exports.NON_EXECUTABLE_FILE_MODE = 420;
exports.EXECUTABLE_FILE_MODE = 493;
var emptyFilePatch = function () { return ({
    diffLineFromPath: null,
    diffLineToPath: null,
    oldMode: null,
    newMode: null,
    deletedFileMode: null,
    newFileMode: null,
    renameFrom: null,
    renameTo: null,
    beforeHash: null,
    afterHash: null,
    fromPath: null,
    toPath: null,
    hunks: null,
}); };
var emptyHunk = function (headerLine) { return ({
    header: exports.parseHunkHeaderLine(headerLine),
    parts: [],
}); };
var hunkLinetypes = {
    "@": "header",
    "-": "deletion",
    "+": "insertion",
    " ": "context",
    "\\": "pragma",
    // Treat blank lines as context
    undefined: "context",
};
function parsePatchLines(lines, _a) {
    var supportLegacyDiffs = _a.supportLegacyDiffs;
    var result = [];
    var currentFilePatch = emptyFilePatch();
    var state = "parsing header";
    var currentHunk = null;
    var currentHunkMutationPart = null;
    function commitHunk() {
        if (currentHunk) {
            if (currentHunkMutationPart) {
                currentHunk.parts.push(currentHunkMutationPart);
                currentHunkMutationPart = null;
            }
            currentFilePatch.hunks.push(currentHunk);
            currentHunk = null;
        }
    }
    function commitFilePatch() {
        commitHunk();
        result.push(currentFilePatch);
        currentFilePatch = emptyFilePatch();
    }
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (state === "parsing header") {
            if (line.startsWith("@@")) {
                state = "parsing hunks";
                currentFilePatch.hunks = [];
                i--;
            }
            else if (line.startsWith("diff --git ")) {
                if (currentFilePatch && currentFilePatch.diffLineFromPath) {
                    commitFilePatch();
                }
                var match = line.match(/^diff --git a\/(.*?) b\/(.*?)\s*$/);
                if (!match) {
                    throw new Error("Bad diff line: " + line);
                }
                currentFilePatch.diffLineFromPath = match[1];
                currentFilePatch.diffLineToPath = match[2];
            }
            else if (line.startsWith("old mode ")) {
                currentFilePatch.oldMode = line.slice("old mode ".length).trim();
            }
            else if (line.startsWith("new mode ")) {
                currentFilePatch.newMode = line.slice("new mode ".length).trim();
            }
            else if (line.startsWith("deleted file mode ")) {
                currentFilePatch.deletedFileMode = line
                    .slice("deleted file mode ".length)
                    .trim();
            }
            else if (line.startsWith("new file mode ")) {
                currentFilePatch.newFileMode = line
                    .slice("new file mode ".length)
                    .trim();
            }
            else if (line.startsWith("rename from ")) {
                currentFilePatch.renameFrom = line.slice("rename from ".length).trim();
            }
            else if (line.startsWith("rename to ")) {
                currentFilePatch.renameTo = line.slice("rename to ".length).trim();
            }
            else if (line.startsWith("index ")) {
                var match = line.match(/(\w+)\.\.(\w+)/);
                if (!match) {
                    continue;
                }
                currentFilePatch.beforeHash = match[1];
                currentFilePatch.afterHash = match[2];
            }
            else if (line.startsWith("--- ")) {
                currentFilePatch.fromPath = line.slice("--- a/".length).trim();
            }
            else if (line.startsWith("+++ ")) {
                currentFilePatch.toPath = line.slice("+++ b/".length).trim();
            }
        }
        else {
            if (supportLegacyDiffs && line.startsWith("--- a/")) {
                state = "parsing header";
                commitFilePatch();
                i--;
                continue;
            }
            // parsing hunks
            var lineType = hunkLinetypes[line[0]] || null;
            switch (lineType) {
                case "header":
                    commitHunk();
                    currentHunk = emptyHunk(line);
                    break;
                case null:
                    // unrecognized, bail out
                    state = "parsing header";
                    commitFilePatch();
                    i--;
                    break;
                case "pragma":
                    if (!line.startsWith("\\ No newline at end of file")) {
                        throw new Error("Unrecognized pragma in patch file: " + line);
                    }
                    if (!currentHunkMutationPart) {
                        throw new Error("Bad parser state: No newline at EOF pragma encountered without context");
                    }
                    currentHunkMutationPart.noNewlineAtEndOfFile = true;
                    break;
                case "insertion":
                case "deletion":
                case "context":
                    if (!currentHunk) {
                        throw new Error("Bad parser state: Hunk lines encountered before hunk header");
                    }
                    if (currentHunkMutationPart &&
                        currentHunkMutationPart.type !== lineType) {
                        currentHunk.parts.push(currentHunkMutationPart);
                        currentHunkMutationPart = null;
                    }
                    if (!currentHunkMutationPart) {
                        currentHunkMutationPart = {
                            type: lineType,
                            lines: [],
                            noNewlineAtEndOfFile: false,
                        };
                    }
                    currentHunkMutationPart.lines.push(line.slice(1));
                    break;
                default:
                    // exhausitveness check
                    assertNever_1.assertNever(lineType);
            }
        }
    }
    commitFilePatch();
    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
        var hunks = result_1[_i].hunks;
        if (hunks) {
            for (var _b = 0, hunks_1 = hunks; _b < hunks_1.length; _b++) {
                var hunk = hunks_1[_b];
                verifyHunkIntegrity(hunk);
            }
        }
    }
    return result;
}
function interpretParsedPatchFile(files) {
    var result = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var diffLineFromPath = file.diffLineFromPath, diffLineToPath = file.diffLineToPath, oldMode = file.oldMode, newMode = file.newMode, deletedFileMode = file.deletedFileMode, newFileMode = file.newFileMode, renameFrom = file.renameFrom, renameTo = file.renameTo, beforeHash = file.beforeHash, afterHash = file.afterHash, fromPath = file.fromPath, toPath = file.toPath, hunks = file.hunks;
        var type = renameFrom
            ? "rename"
            : deletedFileMode
                ? "file deletion"
                : newFileMode
                    ? "file creation"
                    : hunks && hunks.length > 0
                        ? "patch"
                        : "mode change";
        var destinationFilePath = null;
        switch (type) {
            case "rename":
                if (!renameFrom || !renameTo) {
                    throw new Error("Bad parser state: rename from & to not given");
                }
                result.push({
                    type: "rename",
                    fromPath: renameFrom,
                    toPath: renameTo,
                });
                destinationFilePath = renameTo;
                break;
            case "file deletion": {
                var path = diffLineFromPath || fromPath;
                if (!path) {
                    throw new Error("Bad parse state: no path given for file deletion");
                }
                result.push({
                    type: "file deletion",
                    hunk: (hunks && hunks[0]) || null,
                    path: path,
                    mode: parseFileMode(deletedFileMode),
                    hash: beforeHash,
                });
                break;
            }
            case "file creation": {
                var path = diffLineToPath || toPath;
                if (!path) {
                    throw new Error("Bad parse state: no path given for file creation");
                }
                result.push({
                    type: "file creation",
                    hunk: (hunks && hunks[0]) || null,
                    path: path,
                    mode: parseFileMode(newFileMode),
                    hash: afterHash,
                });
                break;
            }
            case "patch":
            case "mode change":
                destinationFilePath = toPath || diffLineToPath;
                break;
            default:
                assertNever_1.assertNever(type);
        }
        if (destinationFilePath && oldMode && newMode && oldMode !== newMode) {
            result.push({
                type: "mode change",
                path: destinationFilePath,
                oldMode: parseFileMode(oldMode),
                newMode: parseFileMode(newMode),
            });
        }
        if (destinationFilePath && hunks && hunks.length) {
            result.push({
                type: "patch",
                path: destinationFilePath,
                hunks: hunks,
                beforeHash: beforeHash,
                afterHash: afterHash,
            });
        }
    }
    return result;
}
exports.interpretParsedPatchFile = interpretParsedPatchFile;
function parseFileMode(mode) {
    // tslint:disable-next-line:no-bitwise
    var parsedMode = parseInt(mode, 8) & 511;
    if (parsedMode !== exports.NON_EXECUTABLE_FILE_MODE &&
        parsedMode !== exports.EXECUTABLE_FILE_MODE) {
        throw new Error("Unexpected file mode string: " + mode);
    }
    return parsedMode;
}
function parsePatchFile(file) {
    var lines = file.split(/\n/g);
    if (lines[lines.length - 1] === "") {
        lines.pop();
    }
    try {
        return interpretParsedPatchFile(parsePatchLines(lines, { supportLegacyDiffs: false }));
    }
    catch (e) {
        if (e instanceof Error &&
            e.message === "hunk header integrity check failed") {
            return interpretParsedPatchFile(parsePatchLines(lines, { supportLegacyDiffs: true }));
        }
        throw e;
    }
}
exports.parsePatchFile = parsePatchFile;
function verifyHunkIntegrity(hunk) {
    // verify hunk integrity
    var originalLength = 0;
    var patchedLength = 0;
    for (var _i = 0, _a = hunk.parts; _i < _a.length; _i++) {
        var _b = _a[_i], type = _b.type, lines = _b.lines;
        switch (type) {
            case "context":
                patchedLength += lines.length;
                originalLength += lines.length;
                break;
            case "deletion":
                originalLength += lines.length;
                break;
            case "insertion":
                patchedLength += lines.length;
                break;
            default:
                assertNever_1.assertNever(type);
        }
    }
    if (originalLength !== hunk.header.original.length ||
        patchedLength !== hunk.header.patched.length) {
        throw new Error("hunk header integrity check failed");
    }
}
exports.verifyHunkIntegrity = verifyHunkIntegrity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGF0Y2gvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBNEM7QUFhL0IsUUFBQSxtQkFBbUIsR0FBRyxVQUFDLFVBQWtCO0lBQ3BELElBQU0sS0FBSyxHQUFHLFVBQVU7U0FDckIsSUFBSSxFQUFFO1NBQ04sS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUE7SUFDckQsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXFCLFVBQVUsTUFBRyxDQUFDLENBQUE7S0FDcEQ7SUFFRCxPQUFPO1FBQ0wsUUFBUSxFQUFFO1lBQ1IsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUI7UUFDRCxPQUFPLEVBQUU7WUFDUCxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM5QjtLQUNGLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFWSxRQUFBLHdCQUF3QixHQUFHLEdBQUssQ0FBQTtBQUNoQyxRQUFBLG9CQUFvQixHQUFHLEdBQUssQ0FBQTtBQStFekMsSUFBTSxjQUFjLEdBQUcsY0FBaUIsT0FBQSxDQUFDO0lBQ3ZDLGdCQUFnQixFQUFFLElBQUk7SUFDdEIsY0FBYyxFQUFFLElBQUk7SUFDcEIsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSTtJQUNiLGVBQWUsRUFBRSxJQUFJO0lBQ3JCLFdB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VyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQ3BCO0tBQ0Y7SUFFRCxJQUNFLGNBQWMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNO1FBQzlDLGFBQWEsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQzVDO1FBQ0EsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFBO0tBQ3REO0FBQ0gsQ0FBQztBQTNCRCxrREEyQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnROZXZlciB9IGZyb20gXCIuLi9hc3NlcnROZXZlclwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgSHVua0hlYWRlciB7XG4gIG9yaWdpbmFsOiB7XG4gICAgc3RhcnQ6IG51bWJlclxuICAgIGxlbmd0aDogbnVtYmVyXG4gIH1cbiAgcGF0Y2hlZDoge1xuICAgIHN0YXJ0OiBudW1iZXJcbiAgICBsZW5ndGg6IG51bWJlclxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBwYXJzZUh1bmtIZWFkZXJMaW5lID0gKGhlYWRlckxpbmU6IHN0cmluZyk6IEh1bmtIZWFkZXIgPT4ge1xuICBjb25zdCBtYXRjaCA9IGhlYWRlckxpbmVcbiAgICAudHJpbSgpXG4gICAgLm1hdGNoKC9eQEAgLShcXGQrKSgsKFxcZCspKT8gXFwrKFxcZCspKCwoXFxkKykpPyBAQC4qLylcbiAgaWYgKCFtYXRjaCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQmFkIGhlYWRlciBsaW5lOiAnJHtoZWFkZXJMaW5lfSdgKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBvcmlnaW5hbDoge1xuICAgICAgc3RhcnQ6IE1hdGgubWF4KE51bWJlcihtYXRjaFsxXSksIDEpLFxuICAgICAgbGVuZ3RoOiBOdW1iZXIobWF0Y2hbM10gfHwgMSksXG4gICAgfSxcbiAgICBwYXRjaGVkOiB7XG4gICAgICBzdGFydDogTWF0aC5tYXgoTnVtYmVyKG1hdGNoWzRdKSwgMSksXG4gICAgICBsZW5ndGg6IE51bWJlcihtYXRjaFs2XSB8fCAxKSxcbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBOT05fRVhFQ1VUQUJMRV9GSUxFX01PREUgPSAwbzY0NFxuZXhwb3J0IGNvbnN0IEVYRUNVVEFCTEVfRklMRV9NT0RFID0gMG83NTVcblxudHlwZSBGaWxlTW9kZSA9IHR5cGVvZiBOT05fRVhFQ1VUQUJMRV9GSUxFX01PREUgfCB0eXBlb2YgRVhFQ1VUQUJMRV9GSUxFX01PREVcblxuaW50ZXJmYWNlIFBhdGNoTXV0YXRpb25QYXJ0IHtcbiAgdHlwZTogXCJjb250ZXh0XCIgfCBcImluc2VydGlvblwiIHwgXCJkZWxldGlvblwiXG4gIGxpbmVzOiBzdHJpbmdbXVxuICBub05ld2xpbmVBdEVuZE9mRmlsZTogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgRmlsZVJlbmFtZSB7XG4gIHR5cGU6IFwicmVuYW1lXCJcbiAgZnJvbVBhdGg6IHN0cmluZ1xuICB0b1BhdGg6IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgRmlsZU1vZGVDaGFuZ2Uge1xuICB0eXBlOiBcIm1vZGUgY2hhbmdlXCJcbiAgcGF0aDogc3RyaW5nXG4gIG9sZE1vZGU6IEZpbGVNb2RlXG4gIG5ld01vZGU6IEZpbGVNb2RlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVBhdGNoIHtcbiAgdHlwZTogXCJwYXRjaFwiXG4gIHBhdGg6IHN0cmluZ1xuICBodW5rczogSHVua1tdXG4gIGJlZm9yZUhhc2g6IHN0cmluZyB8IG51bGxcbiAgYWZ0ZXJIYXNoOiBzdHJpbmcgfCBudWxsXG59XG5cbmludGVyZmFjZSBGaWxlRGVsZXRpb24ge1xuICB0eXBlOiBcImZpbGUgZGVsZXRpb25cIlxuICBwYXRoOiBzdHJpbmdcbiAgbW9kZTogRmlsZU1vZGVcbiAgaHVuazogSHVuayB8IG51bGxcbiAgaGFzaDogc3RyaW5nIHwgbnVsbFxufVxuXG5pbnRlcmZhY2UgRmlsZUNyZWF0aW9uIHtcbiAgdHlwZTogXCJmaWxlIGNyZWF0aW9uXCJcbiAgbW9kZTogRmlsZU1vZGVcbiAgcGF0aDogc3RyaW5nXG4gIGh1bms6IEh1bmsgfCBudWxsXG4gIGhhc2g6IHN0cmluZyB8IG51bGxcbn1cblxuZXhwb3J0IHR5cGUgUGF0Y2hGaWxlUGFydCA9XG4gIHwgRmlsZVBhdGNoXG4gIHwgRmlsZURlbGV0aW9uXG4gIHwgRmlsZUNyZWF0aW9uXG4gIHwgRmlsZVJlbmFtZVxuICB8IEZpbGVNb2RlQ2hhbmdlXG5cbmV4cG9ydCB0eXBlIFBhcnNlZFBhdGNoRmlsZSA9IFBhdGNoRmlsZVBhcnRbXVxuXG50eXBlIFN0YXRlID0gXCJwYXJzaW5nIGhlYWRlclwiIHwgXCJwYXJzaW5nIGh1bmtzXCJcblxuaW50ZXJmYWNlIEZpbGVEZWV0cyB7XG4gIGRpZmZMaW5lRnJvbVBhdGg6IHN0cmluZyB8IG51bGxcbiAgZGlmZkxpbmVUb1BhdGg6IHN0cmluZyB8IG51bGxcbiAgb2xkTW9kZTogc3RyaW5nIHwgbnVsbFxuICBuZXdNb2RlOiBzdHJpbmcgfCBudWxsXG4gIGRlbGV0ZWRGaWxlTW9kZTogc3RyaW5nIHwgbnVsbFxuICBuZXdGaWxlTW9kZTogc3RyaW5nIHwgbnVsbFxuICByZW5hbWVGcm9tOiBzdHJpbmcgfCBudWxsXG4gIHJlbmFtZVRvOiBzdHJpbmcgfCBudWxsXG4gIGJlZm9yZUhhc2g6IHN0cmluZyB8IG51bGxcbiAgYWZ0ZXJIYXNoOiBzdHJpbmcgfCBudWxsXG4gIGZyb21QYXRoOiBzdHJpbmcgfCBudWxsXG4gIHRvUGF0aDogc3RyaW5nIHwgbnVsbFxuICBodW5rczogSHVua1tdIHwgbnVsbFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEh1bmsge1xuICBoZWFkZXI6IEh1bmtIZWFkZXJcbiAgcGFydHM6IFBhdGNoTXV0YXRpb25QYXJ0W11cbn1cblxuY29uc3QgZW1wdHlGaWxlUGF0Y2ggPSAoKTogRmlsZURlZXRzID0+ICh7XG4gIGRpZmZMaW5lRnJvbVBhdGg6IG51bGwsXG4gIGRpZmZMaW5lVG9QYXRoOiBudWxsLFxuICBvbGRNb2RlOiBudWxsLFxuICBuZXdNb2RlOiBudWxsLFxuICBkZWxldGVkRmlsZU1vZGU6IG51bGwsXG4gIG5ld0ZpbGVNb2RlOiBudWxsLFxuICByZW5hbWVGcm9tOiBudWxsLFxuICByZW5hbWVUbzogbnVsbCxcbiAgYmVmb3JlSGFzaDogbnVsbCxcbiAgYWZ0ZXJIYXNoOiBudWxsLFxuICBmcm9tUGF0aDogbnVsbCxcbiAgdG9QYXRoOiBudWxsLFxuICBodW5rczogbnVsbCxcbn0pXG5cbmNvbnN0IGVtcHR5SHVuayA9IChoZWFkZXJMaW5lOiBzdHJpbmcpOiBIdW5rID0+ICh7XG4gIGhlYWRlcjogcGFyc2VIdW5rSGVhZGVyTGluZShoZWFkZXJMaW5lKSxcbiAgcGFydHM6IFtdLFxufSlcblxuY29uc3QgaHVua0xpbmV0eXBlczoge1xuICBbazogc3RyaW5nXTogUGF0Y2hNdXRhdGlvblBhcnRbXCJ0eXBlXCJdIHwgXCJwcmFnbWFcIiB8IFwiaGVhZGVyXCJcbn0gPSB7XG4gIFwiQFwiOiBcImhlYWRlclwiLFxuICBcIi1cIjogXCJkZWxldGlvblwiLFxuICBcIitcIjogXCJpbnNlcnRpb25cIixcbiAgXCIgXCI6IFwiY29udGV4dFwiLFxuICBcIlxcXFxcIjogXCJwcmFnbWFcIixcbiAgLy8gVHJlYXQgYmxhbmsgbGluZXMgYXMgY29udGV4dFxuICB1bmRlZmluZWQ6IFwiY29udGV4dFwiLFxufVxuXG5mdW5jdGlvbiBwYXJzZVBhdGNoTGluZXMoXG4gIGxpbmVzOiBzdHJpbmdbXSxcbiAgeyBzdXBwb3J0TGVnYWN5RGlmZnMgfTogeyBzdXBwb3J0TGVnYWN5RGlmZnM6IGJvb2xlYW4gfSxcbik6IEZpbGVEZWV0c1tdIHtcbiAgY29uc3QgcmVzdWx0OiBGaWxlRGVldHNbXSA9IFtdXG4gIGxldCBjdXJyZW50RmlsZVBhdGNoOiBGaWxlRGVldHMgPSBlbXB0eUZpbGVQYXRjaCgpXG4gIGxldCBzdGF0ZTogU3RhdGUgPSBcInBhcnNpbmcgaGVhZGVyXCJcbiAgbGV0IGN1cnJlbnRIdW5rOiBIdW5rIHwgbnVsbCA9IG51bGxcbiAgbGV0IGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0OiBQYXRjaE11dGF0aW9uUGFydCB8IG51bGwgPSBudWxsXG5cbiAgZnVuY3Rpb24gY29tbWl0SHVuaygpIHtcbiAgICBpZiAoY3VycmVudEh1bmspIHtcbiAgICAgIGlmIChjdXJyZW50SHVua011dGF0aW9uUGFydCkge1xuICAgICAgICBjdXJyZW50SHVuay5wYXJ0cy5wdXNoKGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0KVxuICAgICAgICBjdXJyZW50SHVua011dGF0aW9uUGFydCA9IG51bGxcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRGaWxlUGF0Y2guaHVua3MhLnB1c2goY3VycmVudEh1bmspXG4gICAgICBjdXJyZW50SHVuayA9IG51bGxcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb21taXRGaWxlUGF0Y2goKSB7XG4gICAgY29tbWl0SHVuaygpXG4gICAgcmVzdWx0LnB1c2goY3VycmVudEZpbGVQYXRjaClcbiAgICBjdXJyZW50RmlsZVBhdGNoID0gZW1wdHlGaWxlUGF0Y2goKVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tpXVxuXG4gICAgaWYgKHN0YXRlID09PSBcInBhcnNpbmcgaGVhZGVyXCIpIHtcbiAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJAQFwiKSkge1xuICAgICAgICBzdGF0ZSA9IFwicGFyc2luZyBodW5rc1wiXG4gICAgICAgIGN1cnJlbnRGaWxlUGF0Y2guaHVua3MgPSBbXVxuICAgICAgICBpLS1cbiAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwiZGlmZiAtLWdpdCBcIikpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRGaWxlUGF0Y2ggJiYgY3VycmVudEZpbGVQYXRjaC5kaWZmTGluZUZyb21QYXRoKSB7XG4gICAgICAgICAgY29tbWl0RmlsZVBhdGNoKClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL15kaWZmIC0tZ2l0IGFcXC8oLio/KSBiXFwvKC4qPylcXHMqJC8pXG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCYWQgZGlmZiBsaW5lOiBcIiArIGxpbmUpXG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5kaWZmTGluZUZyb21QYXRoID0gbWF0Y2hbMV1cbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5kaWZmTGluZVRvUGF0aCA9IG1hdGNoWzJdXG4gICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcIm9sZCBtb2RlIFwiKSkge1xuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLm9sZE1vZGUgPSBsaW5lLnNsaWNlKFwib2xkIG1vZGUgXCIubGVuZ3RoKS50cmltKClcbiAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwibmV3IG1vZGUgXCIpKSB7XG4gICAgICAgIGN1cnJlbnRGaWxlUGF0Y2gubmV3TW9kZSA9IGxpbmUuc2xpY2UoXCJuZXcgbW9kZSBcIi5sZW5ndGgpLnRyaW0oKVxuICAgICAgfSBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJkZWxldGVkIGZpbGUgbW9kZSBcIikpIHtcbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5kZWxldGVkRmlsZU1vZGUgPSBsaW5lXG4gICAgICAgICAgLnNsaWNlKFwiZGVsZXRlZCBmaWxlIG1vZGUgXCIubGVuZ3RoKVxuICAgICAgICAgIC50cmltKClcbiAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwibmV3IGZpbGUgbW9kZSBcIikpIHtcbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5uZXdGaWxlTW9kZSA9IGxpbmVcbiAgICAgICAgICAuc2xpY2UoXCJuZXcgZmlsZSBtb2RlIFwiLmxlbmd0aClcbiAgICAgICAgICAudHJpbSgpXG4gICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcInJlbmFtZSBmcm9tIFwiKSkge1xuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLnJlbmFtZUZyb20gPSBsaW5lLnNsaWNlKFwicmVuYW1lIGZyb20gXCIubGVuZ3RoKS50cmltKClcbiAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwicmVuYW1lIHRvIFwiKSkge1xuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLnJlbmFtZVRvID0gbGluZS5zbGljZShcInJlbmFtZSB0byBcIi5sZW5ndGgpLnRyaW0oKVxuICAgICAgfSBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJpbmRleCBcIikpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC8oXFx3KylcXC5cXC4oXFx3KykvKVxuICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLmJlZm9yZUhhc2ggPSBtYXRjaFsxXVxuICAgICAgICBjdXJyZW50RmlsZVBhdGNoLmFmdGVySGFzaCA9IG1hdGNoWzJdXG4gICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcIi0tLSBcIikpIHtcbiAgICAgICAgY3VycmVudEZpbGVQYXRjaC5mcm9tUGF0aCA9IGxpbmUuc2xpY2UoXCItLS0gYS9cIi5sZW5ndGgpLnRyaW0oKVxuICAgICAgfSBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCIrKysgXCIpKSB7XG4gICAgICAgIGN1cnJlbnRGaWxlUGF0Y2gudG9QYXRoID0gbGluZS5zbGljZShcIisrKyBiL1wiLmxlbmd0aCkudHJpbSgpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdXBwb3J0TGVnYWN5RGlmZnMgJiYgbGluZS5zdGFydHNXaXRoKFwiLS0tIGEvXCIpKSB7XG4gICAgICAgIHN0YXRlID0gXCJwYXJzaW5nIGhlYWRlclwiXG4gICAgICAgIGNvbW1pdEZpbGVQYXRjaCgpXG4gICAgICAgIGktLVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgLy8gcGFyc2luZyBodW5rc1xuICAgICAgY29uc3QgbGluZVR5cGUgPSBodW5rTGluZXR5cGVzW2xpbmVbMF1dIHx8IG51bGxcbiAgICAgIHN3aXRjaCAobGluZVR5cGUpIHtcbiAgICAgICAgY2FzZSBcImhlYWRlclwiOlxuICAgICAgICAgIGNvbW1pdEh1bmsoKVxuICAgICAgICAgIGN1cnJlbnRIdW5rID0gZW1wdHlIdW5rKGxpbmUpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBudWxsOlxuICAgICAgICAgIC8vIHVucmVjb2duaXplZCwgYmFpbCBvdXRcbiAgICAgICAgICBzdGF0ZSA9IFwicGFyc2luZyBoZWFkZXJcIlxuICAgICAgICAgIGNvbW1pdEZpbGVQYXRjaCgpXG4gICAgICAgICAgaS0tXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcInByYWdtYVwiOlxuICAgICAgICAgIGlmICghbGluZS5zdGFydHNXaXRoKFwiXFxcXCBObyBuZXdsaW5lIGF0IGVuZCBvZiBmaWxlXCIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnJlY29nbml6ZWQgcHJhZ21hIGluIHBhdGNoIGZpbGU6IFwiICsgbGluZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFjdXJyZW50SHVua011dGF0aW9uUGFydCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcIkJhZCBwYXJzZXIgc3RhdGU6IE5vIG5ld2xpbmUgYXQgRU9GIHByYWdtYSBlbmNvdW50ZXJlZCB3aXRob3V0IGNvbnRleHRcIixcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudEh1bmtNdXRhdGlvblBhcnQubm9OZXdsaW5lQXRFbmRPZkZpbGUgPSB0cnVlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcImluc2VydGlvblwiOlxuICAgICAgICBjYXNlIFwiZGVsZXRpb25cIjpcbiAgICAgICAgY2FzZSBcImNvbnRleHRcIjpcbiAgICAgICAgICBpZiAoIWN1cnJlbnRIdW5rKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIFwiQmFkIHBhcnNlciBzdGF0ZTogSHVuayBsaW5lcyBlbmNvdW50ZXJlZCBiZWZvcmUgaHVuayBoZWFkZXJcIixcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgY3VycmVudEh1bmtNdXRhdGlvblBhcnQgJiZcbiAgICAgICAgICAgIGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0LnR5cGUgIT09IGxpbmVUeXBlXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBjdXJyZW50SHVuay5wYXJ0cy5wdXNoKGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0KVxuICAgICAgICAgICAgY3VycmVudEh1bmtNdXRhdGlvblBhcnQgPSBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghY3VycmVudEh1bmtNdXRhdGlvblBhcnQpIHtcbiAgICAgICAgICAgIGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0ID0ge1xuICAgICAgICAgICAgICB0eXBlOiBsaW5lVHlwZSxcbiAgICAgICAgICAgICAgbGluZXM6IFtdLFxuICAgICAgICAgICAgICBub05ld2xpbmVBdEVuZE9mRmlsZTogZmFsc2UsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnJlbnRIdW5rTXV0YXRpb25QYXJ0LmxpbmVzLnB1c2gobGluZS5zbGljZSgxKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIGV4aGF1c2l0dmVuZXNzIGNoZWNrXG4gICAgICAgICAgYXNzZXJ0TmV2ZXIobGluZVR5cGUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29tbWl0RmlsZVBhdGNoKClcblxuICBmb3IgKGNvbnN0IHsgaHVua3MgfSBvZiByZXN1bHQpIHtcbiAgICBpZiAoaHVua3MpIHtcbiAgICAgIGZvciAoY29uc3QgaHVuayBvZiBodW5rcykge1xuICAgICAgICB2ZXJpZnlIdW5rSW50ZWdyaXR5KGh1bmspXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJwcmV0UGFyc2VkUGF0Y2hGaWxlKGZpbGVzOiBGaWxlRGVldHNbXSk6IFBhcnNlZFBhdGNoRmlsZSB7XG4gIGNvbnN0IHJlc3VsdDogUGFyc2VkUGF0Y2hGaWxlID0gW11cblxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBjb25zdCB7XG4gICAgICBkaWZmTGluZUZyb21QYXRoLFxuICAgICAgZGlmZkxpbmVUb1BhdGgsXG4gICAgICBvbGRNb2RlLFxuICAgICAgbmV3TW9kZSxcbiAgICAgIGRlbGV0ZWRGaWxlTW9kZSxcbiAgICAgIG5ld0ZpbGVNb2RlLFxuICAgICAgcmVuYW1lRnJvbSxcbiAgICAgIHJlbmFtZVRvLFxuICAgICAgYmVmb3JlSGFzaCxcbiAgICAgIGFmdGVySGFzaCxcbiAgICAgIGZyb21QYXRoLFxuICAgICAgdG9QYXRoLFxuICAgICAgaHVua3MsXG4gICAgfSA9IGZpbGVcbiAgICBjb25zdCB0eXBlOiBQYXRjaEZpbGVQYXJ0W1widHlwZVwiXSA9IHJlbmFtZUZyb21cbiAgICAgID8gXCJyZW5hbWVcIlxuICAgICAgOiBkZWxldGVkRmlsZU1vZGVcbiAgICAgID8gXCJmaWxlIGRlbGV0aW9uXCJcbiAgICAgIDogbmV3RmlsZU1vZGVcbiAgICAgID8gXCJmaWxlIGNyZWF0aW9uXCJcbiAgICAgIDogaHVua3MgJiYgaHVua3MubGVuZ3RoID4gMFxuICAgICAgPyBcInBhdGNoXCJcbiAgICAgIDogXCJtb2RlIGNoYW5nZVwiXG5cbiAgICBsZXQgZGVzdGluYXRpb25GaWxlUGF0aDogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJyZW5hbWVcIjpcbiAgICAgICAgaWYgKCFyZW5hbWVGcm9tIHx8ICFyZW5hbWVUbykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJhZCBwYXJzZXIgc3RhdGU6IHJlbmFtZSBmcm9tICYgdG8gbm90IGdpdmVuXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwicmVuYW1lXCIsXG4gICAgICAgICAgZnJvbVBhdGg6IHJlbmFtZUZyb20sXG4gICAgICAgICAgdG9QYXRoOiByZW5hbWVUbyxcbiAgICAgICAgfSlcbiAgICAgICAgZGVzdGluYXRpb25GaWxlUGF0aCA9IHJlbmFtZVRvXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwiZmlsZSBkZWxldGlvblwiOiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBkaWZmTGluZUZyb21QYXRoIHx8IGZyb21QYXRoXG4gICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJhZCBwYXJzZSBzdGF0ZTogbm8gcGF0aCBnaXZlbiBmb3IgZmlsZSBkZWxldGlvblwiKVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZpbGUgZGVsZXRpb25cIixcbiAgICAgICAgICBodW5rOiAoaHVua3MgJiYgaHVua3NbMF0pIHx8IG51bGwsXG4gICAgICAgICAgcGF0aCxcbiAgICAgICAgICBtb2RlOiBwYXJzZUZpbGVNb2RlKGRlbGV0ZWRGaWxlTW9kZSEpLFxuICAgICAgICAgIGhhc2g6IGJlZm9yZUhhc2gsXG4gICAgICAgIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlIFwiZmlsZSBjcmVhdGlvblwiOiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBkaWZmTGluZVRvUGF0aCB8fCB0b1BhdGhcbiAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmFkIHBhcnNlIHN0YXRlOiBubyBwYXRoIGdpdmVuIGZvciBmaWxlIGNyZWF0aW9uXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZmlsZSBjcmVhdGlvblwiLFxuICAgICAgICAgIGh1bms6IChodW5rcyAmJiBodW5rc1swXSkgfHwgbnVsbCxcbiAgICAgICAgICBwYXRoLFxuICAgICAgICAgIG1vZGU6IHBhcnNlRmlsZU1vZGUobmV3RmlsZU1vZGUhKSxcbiAgICAgICAgICBoYXNoOiBhZnRlckhhc2gsXG4gICAgICAgIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlIFwicGF0Y2hcIjpcbiAgICAgIGNhc2UgXCJtb2RlIGNoYW5nZVwiOlxuICAgICAgICBkZXN0aW5hdGlvbkZpbGVQYXRoID0gdG9QYXRoIHx8IGRpZmZMaW5lVG9QYXRoXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhc3NlcnROZXZlcih0eXBlKVxuICAgIH1cblxuICAgIGlmIChkZXN0aW5hdGlvbkZpbGVQYXRoICYmIG9sZE1vZGUgJiYgbmV3TW9kZSAmJiBvbGRNb2RlICE9PSBuZXdNb2RlKSB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIHR5cGU6IFwibW9kZSBjaGFuZ2VcIixcbiAgICAgICAgcGF0aDogZGVzdGluYXRpb25GaWxlUGF0aCxcbiAgICAgICAgb2xkTW9kZTogcGFyc2VGaWxlTW9kZShvbGRNb2RlKSxcbiAgICAgICAgbmV3TW9kZTogcGFyc2VGaWxlTW9kZShuZXdNb2RlKSxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKGRlc3RpbmF0aW9uRmlsZVBhdGggJiYgaHVua3MgJiYgaHVua3MubGVuZ3RoKSB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIHR5cGU6IFwicGF0Y2hcIixcbiAgICAgICAgcGF0aDogZGVzdGluYXRpb25GaWxlUGF0aCxcbiAgICAgICAgaHVua3MsXG4gICAgICAgIGJlZm9yZUhhc2gsXG4gICAgICAgIGFmdGVySGFzaCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBwYXJzZUZpbGVNb2RlKG1vZGU6IHN0cmluZyk6IEZpbGVNb2RlIHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWJpdHdpc2VcbiAgY29uc3QgcGFyc2VkTW9kZSA9IHBhcnNlSW50KG1vZGUsIDgpICYgMG83NzdcbiAgaWYgKFxuICAgIHBhcnNlZE1vZGUgIT09IE5PTl9FWEVDVVRBQkxFX0ZJTEVfTU9ERSAmJlxuICAgIHBhcnNlZE1vZGUgIT09IEVYRUNVVEFCTEVfRklMRV9NT0RFXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgZmlsZSBtb2RlIHN0cmluZzogXCIgKyBtb2RlKVxuICB9XG4gIHJldHVybiBwYXJzZWRNb2RlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBhdGNoRmlsZShmaWxlOiBzdHJpbmcpOiBQYXJzZWRQYXRjaEZpbGUge1xuICBjb25zdCBsaW5lcyA9IGZpbGUuc3BsaXQoL1xcbi9nKVxuICBpZiAobGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09IFwiXCIpIHtcbiAgICBsaW5lcy5wb3AoKVxuICB9XG4gIHRyeSB7XG4gICAgcmV0dXJuIGludGVycHJldFBhcnNlZFBhdGNoRmlsZShcbiAgICAgIHBhcnNlUGF0Y2hMaW5lcyhsaW5lcywgeyBzdXBwb3J0TGVnYWN5RGlmZnM6IGZhbHNlIH0pLFxuICAgIClcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChcbiAgICAgIGUgaW5zdGFuY2VvZiBFcnJvciAmJlxuICAgICAgZS5tZXNzYWdlID09PSBcImh1bmsgaGVhZGVyIGludGVncml0eSBjaGVjayBmYWlsZWRcIlxuICAgICkge1xuICAgICAgcmV0dXJuIGludGVycHJldFBhcnNlZFBhdGNoRmlsZShcbiAgICAgICAgcGFyc2VQYXRjaExpbmVzKGxpbmVzLCB7IHN1cHBvcnRMZWdhY3lEaWZmczogdHJ1ZSB9KSxcbiAgICAgIClcbiAgICB9XG4gICAgdGhyb3cgZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlIdW5rSW50ZWdyaXR5KGh1bms6IEh1bmspIHtcbiAgLy8gdmVyaWZ5IGh1bmsgaW50ZWdyaXR5XG4gIGxldCBvcmlnaW5hbExlbmd0aCA9IDBcbiAgbGV0IHBhdGNoZWRMZW5ndGggPSAwXG4gIGZvciAoY29uc3QgeyB0eXBlLCBsaW5lcyB9IG9mIGh1bmsucGFydHMpIHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJjb250ZXh0XCI6XG4gICAgICAgIHBhdGNoZWRMZW5ndGggKz0gbGluZXMubGVuZ3RoXG4gICAgICAgIG9yaWdpbmFsTGVuZ3RoICs9IGxpbmVzLmxlbmd0aFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImRlbGV0aW9uXCI6XG4gICAgICAgIG9yaWdpbmFsTGVuZ3RoICs9IGxpbmVzLmxlbmd0aFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImluc2VydGlvblwiOlxuICAgICAgICBwYXRjaGVkTGVuZ3RoICs9IGxpbmVzLmxlbmd0aFxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0TmV2ZXIodHlwZSlcbiAgICB9XG4gIH1cblxuICBpZiAoXG4gICAgb3JpZ2luYWxMZW5ndGggIT09IGh1bmsuaGVhZGVyLm9yaWdpbmFsLmxlbmd0aCB8fFxuICAgIHBhdGNoZWRMZW5ndGggIT09IGh1bmsuaGVhZGVyLnBhdGNoZWQubGVuZ3RoXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImh1bmsgaGVhZGVyIGludGVncml0eSBjaGVjayBmYWlsZWRcIilcbiAgfVxufVxuIl19