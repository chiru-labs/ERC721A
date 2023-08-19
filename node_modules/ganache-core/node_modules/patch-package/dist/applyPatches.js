"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var patchFs_1 = require("./patchFs");
var apply_1 = require("./patch/apply");
var fs_extra_1 = require("fs-extra");
var path_1 = require("./path");
var path_2 = require("path");
var PackageDetails_1 = require("./PackageDetails");
var reverse_1 = require("./patch/reverse");
var is_ci_1 = __importDefault(require("is-ci"));
var semver_1 = __importDefault(require("semver"));
var read_1 = require("./patch/read");
var packageIsDevDependency_1 = require("./packageIsDevDependency");
// don't want to exit(1) on postinsall locally.
// see https://github.com/ds300/patch-package/issues/86
var shouldExitPostinstallWithError = is_ci_1.default || process.env.NODE_ENV === "test";
var exit = function () { return process.exit(shouldExitPostinstallWithError ? 1 : 0); };
function findPatchFiles(patchesDirectory) {
    if (!fs_extra_1.existsSync(patchesDirectory)) {
        return [];
    }
    return patchFs_1.getPatchFiles(patchesDirectory);
}
function getInstalledPackageVersion(_a) {
    var appPath = _a.appPath, path = _a.path, pathSpecifier = _a.pathSpecifier, isDevOnly = _a.isDevOnly, patchFilename = _a.patchFilename;
    var packageDir = path_1.join(appPath, path);
    if (!fs_extra_1.existsSync(packageDir)) {
        if (process.env.NODE_ENV === "production" && isDevOnly) {
            return null;
        }
        console.error(chalk_1.default.red("Error:") + " Patch file found for package " + path_2.posix.basename(pathSpecifier) + (" which is not present at " + path_1.relative(".", packageDir)));
        if (!isDevOnly && process.env.NODE_ENV === "production") {
            console.error("\n  If this package is a dev dependency, rename the patch file to\n  \n    " + chalk_1.default.bold(patchFilename.replace(".patch", ".dev.patch")) + "\n");
        }
        exit();
    }
    var version = require(path_1.join(packageDir, "package.json")).version;
    // normalize version for `npm ci`
    var result = semver_1.default.valid(version);
    if (result === null) {
        console.error(chalk_1.default.red("Error:") + " Version string '" + version + "' cannot be parsed from " + path_1.join(packageDir, "package.json"));
        exit();
    }
    return result;
}
function applyPatchesForApp(_a) {
    var appPath = _a.appPath, reverse = _a.reverse, patchDir = _a.patchDir;
    var patchesDirectory = path_1.join(appPath, patchDir);
    var files = findPatchFiles(patchesDirectory);
    if (files.length === 0) {
        console.error(chalk_1.default.red("No patch files found"));
        return;
    }
    files.forEach(function (filename) {
        var packageDetails = PackageDetails_1.getPackageDetailsFromPatchFilename(filename);
        if (!packageDetails) {
            console.warn("Unrecognized patch file in patches directory " + filename);
            return;
        }
        var name = packageDetails.name, version = packageDetails.version, path = packageDetails.path, pathSpecifier = packageDetails.pathSpecifier, isDevOnly = packageDetails.isDevOnly, patchFilename = packageDetails.patchFilename;
        var installedPackageVersion = getInstalledPackageVersion({
            appPath: appPath,
            path: path,
            pathSpecifier: pathSpecifier,
            isDevOnly: isDevOnly ||
                // check for direct-dependents in prod
                (process.env.NODE_ENV === "production" &&
                    packageIsDevDependency_1.packageIsDevDependency({ appPath: appPath, packageDetails: packageDetails })),
            patchFilename: patchFilename,
        });
        if (!installedPackageVersion) {
            // it's ok we're in production mode and this is a dev only package
            console.log("Skipping dev-only " + chalk_1.default.bold(pathSpecifier) + "@" + version + " " + chalk_1.default.blue("✔"));
            return;
        }
        if (applyPatch({
            patchFilePath: path_1.resolve(patchesDirectory, filename),
            reverse: reverse,
            packageDetails: packageDetails,
            patchDir: patchDir,
        })) {
            // yay patch was applied successfully
            // print warning if version mismatch
            if (installedPackageVersion !== version) {
                printVersionMismatchWarning({
                    packageName: name,
                    actualVersion: installedPackageVersion,
                    originalVersion: version,
                    pathSpecifier: pathSpecifier,
                    path: path,
                });
            }
            else {
                console.log(chalk_1.default.bold(pathSpecifier) + "@" + version + " " + chalk_1.default.green("✔"));
            }
        }
        else {
            // completely failed to apply patch
            // TODO: propagate useful error messages from patch application
            if (installedPackageVersion === version) {
                printBrokenPatchFileError({
                    packageName: name,
                    patchFileName: filename,
                    pathSpecifier: pathSpecifier,
                    path: path,
                });
            }
            else {
                printPatchApplictionFailureError({
                    packageName: name,
                    actualVersion: installedPackageVersion,
                    originalVersion: version,
                    patchFileName: filename,
                    path: path,
                    pathSpecifier: pathSpecifier,
                });
            }
            exit();
        }
    });
}
exports.applyPatchesForApp = applyPatchesForApp;
function applyPatch(_a) {
    var patchFilePath = _a.patchFilePath, reverse = _a.reverse, packageDetails = _a.packageDetails, patchDir = _a.patchDir;
    var patch = read_1.readPatch({ patchFilePath: patchFilePath, packageDetails: packageDetails, patchDir: patchDir });
    try {
        apply_1.executeEffects(reverse ? reverse_1.reversePatch(patch) : patch, { dryRun: false });
    }
    catch (e) {
        try {
            apply_1.executeEffects(reverse ? patch : reverse_1.reversePatch(patch), { dryRun: true });
        }
        catch (e) {
            return false;
        }
    }
    return true;
}
exports.applyPatch = applyPatch;
function printVersionMismatchWarning(_a) {
    var packageName = _a.packageName, actualVersion = _a.actualVersion, originalVersion = _a.originalVersion, pathSpecifier = _a.pathSpecifier, path = _a.path;
    console.warn("\n" + chalk_1.default.red("Warning:") + " patch-package detected a patch file version mismatch\n\n  Don't worry! This is probably fine. The patch was still applied\n  successfully. Here's the deets:\n\n  Patch file created for\n\n    " + packageName + "@" + chalk_1.default.bold(originalVersion) + "\n\n  applied to\n\n    " + packageName + "@" + chalk_1.default.bold(actualVersion) + "\n  \n  At path\n  \n    " + path + "\n\n  This warning is just to give you a heads-up. There is a small chance of\n  breakage even though the patch was applied successfully. Make sure the package\n  still behaves like you expect (you wrote tests, right?) and then run\n\n    " + chalk_1.default.bold("patch-package " + pathSpecifier) + "\n\n  to update the version in the patch file name and make this warning go away.\n");
}
function printBrokenPatchFileError(_a) {
    var packageName = _a.packageName, patchFileName = _a.patchFileName, path = _a.path, pathSpecifier = _a.pathSpecifier;
    console.error("\n" + chalk_1.default.red.bold("**ERROR**") + " " + chalk_1.default.red("Failed to apply patch for package " + chalk_1.default.bold(packageName) + " at path") + "\n  \n    " + path + "\n\n  This error was caused because patch-package cannot apply the following patch file:\n\n    patches/" + patchFileName + "\n\n  Try removing node_modules and trying again. If that doesn't work, maybe there was\n  an accidental change made to the patch file? Try recreating it by manually\n  editing the appropriate files and running:\n  \n    patch-package " + pathSpecifier + "\n  \n  If that doesn't work, then it's a bug in patch-package, so please submit a bug\n  report. Thanks!\n\n    https://github.com/ds300/patch-package/issues\n    \n");
}
function printPatchApplictionFailureError(_a) {
    var packageName = _a.packageName, actualVersion = _a.actualVersion, originalVersion = _a.originalVersion, patchFileName = _a.patchFileName, path = _a.path, pathSpecifier = _a.pathSpecifier;
    console.error("\n" + chalk_1.default.red.bold("**ERROR**") + " " + chalk_1.default.red("Failed to apply patch for package " + chalk_1.default.bold(packageName) + " at path") + "\n  \n    " + path + "\n\n  This error was caused because " + chalk_1.default.bold(packageName) + " has changed since you\n  made the patch file for it. This introduced conflicts with your patch,\n  just like a merge conflict in Git when separate incompatible changes are\n  made to the same piece of code.\n\n  Maybe this means your patch file is no longer necessary, in which case\n  hooray! Just delete it!\n\n  Otherwise, you need to generate a new patch file.\n\n  To generate a new one, just repeat the steps you made to generate the first\n  one.\n\n  i.e. manually make the appropriate file changes, then run \n\n    patch-package " + pathSpecifier + "\n\n  Info:\n    Patch file: patches/" + patchFileName + "\n    Patch was made for version: " + chalk_1.default.green.bold(originalVersion) + "\n    Installed version: " + chalk_1.default.red.bold(actualVersion) + "\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHlQYXRjaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcGx5UGF0Y2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdEQUF5QjtBQUN6QixxQ0FBeUM7QUFDekMsdUNBQThDO0FBQzlDLHFDQUFxQztBQUNyQywrQkFBZ0Q7QUFDaEQsNkJBQTRCO0FBQzVCLG1EQUd5QjtBQUN6QiwyQ0FBOEM7QUFDOUMsZ0RBQXdCO0FBQ3hCLGtEQUEyQjtBQUMzQixxQ0FBd0M7QUFDeEMsbUVBQWlFO0FBRWpFLCtDQUErQztBQUMvQyx1REFBdUQ7QUFDdkQsSUFBTSw4QkFBOEIsR0FBRyxlQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssTUFBTSxDQUFBO0FBRTlFLElBQU0sSUFBSSxHQUFHLGNBQU0sT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFwRCxDQUFvRCxDQUFBO0FBRXZFLFNBQVMsY0FBYyxDQUFDLGdCQUF3QjtJQUM5QyxJQUFJLENBQUMscUJBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ2pDLE9BQU8sRUFBRSxDQUFBO0tBQ1Y7SUFFRCxPQUFPLHVCQUFhLENBQUMsZ0JBQWdCLENBQWEsQ0FBQTtBQUNwRCxDQUFDO0FBRUQsU0FBUywwQkFBMEIsQ0FBQyxFQVluQztRQVhDLG9CQUFPLEVBQ1AsY0FBSSxFQUNKLGdDQUFhLEVBQ2Isd0JBQVMsRUFDVCxnQ0FBYTtJQVFiLElBQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDdEMsSUFBSSxDQUFDLHFCQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDM0IsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLElBQUksU0FBUyxFQUFFO1lBQ3RELE9BQU8sSUFBSSxDQUFB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QWEsbVBBTVAsYUFBYSwyS0FPaEMsQ0FBQyxDQUFBO0FBQ0YsQ0FBQztBQUVELFNBQVMsZ0NBQWdDLENBQUMsRUFjekM7UUFiQyw0QkFBVyxFQUNYLGdDQUFhLEVBQ2Isb0NBQWUsRUFDZixnQ0FBYSxFQUNiLGNBQUksRUFDSixnQ0FBYTtJQVNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FDZCxlQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBSSxlQUFLLENBQUMsR0FBRyxDQUN0Qyx1Q0FBcUMsZUFBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBVSxDQUN2RSxrQkFFRyxJQUFJLDRDQUV3QixlQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvaUJBZXJDLGFBQWEsNkNBR1AsYUFBYSwwQ0FDTCxlQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsaUNBQzFDLGVBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUNyRCxDQUFDLENBQUE7QUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gXCJjaGFsa1wiXG5pbXBvcnQgeyBnZXRQYXRjaEZpbGVzIH0gZnJvbSBcIi4vcGF0Y2hGc1wiXG5pbXBvcnQgeyBleGVjdXRlRWZmZWN0cyB9IGZyb20gXCIuL3BhdGNoL2FwcGx5XCJcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwiZnMtZXh0cmFcIlxuaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSwgcmVsYXRpdmUgfSBmcm9tIFwiLi9wYXRoXCJcbmltcG9ydCB7IHBvc2l4IH0gZnJvbSBcInBhdGhcIlxuaW1wb3J0IHtcbiAgZ2V0UGFja2FnZURldGFpbHNGcm9tUGF0Y2hGaWxlbmFtZSxcbiAgUGFja2FnZURldGFpbHMsXG59IGZyb20gXCIuL1BhY2thZ2VEZXRhaWxzXCJcbmltcG9ydCB7IHJldmVyc2VQYXRjaCB9IGZyb20gXCIuL3BhdGNoL3JldmVyc2VcIlxuaW1wb3J0IGlzQ2kgZnJvbSBcImlzLWNpXCJcbmltcG9ydCBzZW12ZXIgZnJvbSBcInNlbXZlclwiXG5pbXBvcnQgeyByZWFkUGF0Y2ggfSBmcm9tIFwiLi9wYXRjaC9yZWFkXCJcbmltcG9ydCB7IHBhY2thZ2VJc0RldkRlcGVuZGVuY3kgfSBmcm9tIFwiLi9wYWNrYWdlSXNEZXZEZXBlbmRlbmN5XCJcblxuLy8gZG9uJ3Qgd2FudCB0byBleGl0KDEpIG9uIHBvc3RpbnNhbGwgbG9jYWxseS5cbi8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZHMzMDAvcGF0Y2gtcGFja2FnZS9pc3N1ZXMvODZcbmNvbnN0IHNob3VsZEV4aXRQb3N0aW5zdGFsbFdpdGhFcnJvciA9IGlzQ2kgfHwgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwidGVzdFwiXG5cbmNvbnN0IGV4aXQgPSAoKSA9PiBwcm9jZXNzLmV4aXQoc2hvdWxkRXhpdFBvc3RpbnN0YWxsV2l0aEVycm9yID8gMSA6IDApXG5cbmZ1bmN0aW9uIGZpbmRQYXRjaEZpbGVzKHBhdGNoZXNEaXJlY3Rvcnk6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgaWYgKCFleGlzdHNTeW5jKHBhdGNoZXNEaXJlY3RvcnkpKSB7XG4gICAgcmV0dXJuIFtdXG4gIH1cblxuICByZXR1cm4gZ2V0UGF0Y2hGaWxlcyhwYXRjaGVzRGlyZWN0b3J5KSBhcyBzdHJpbmdbXVxufVxuXG5mdW5jdGlvbiBnZXRJbnN0YWxsZWRQYWNrYWdlVmVyc2lvbih7XG4gIGFwcFBhdGgsXG4gIHBhdGgsXG4gIHBhdGhTcGVjaWZpZXIsXG4gIGlzRGV2T25seSxcbiAgcGF0Y2hGaWxlbmFtZSxcbn06IHtcbiAgYXBwUGF0aDogc3RyaW5nXG4gIHBhdGg6IHN0cmluZ1xuICBwYXRoU3BlY2lmaWVyOiBzdHJpbmdcbiAgaXNEZXZPbmx5OiBib29sZWFuXG4gIHBhdGNoRmlsZW5hbWU6IHN0cmluZ1xufSk6IG51bGwgfCBzdHJpbmcge1xuICBjb25zdCBwYWNrYWdlRGlyID0gam9pbihhcHBQYXRoLCBwYXRoKVxuICBpZiAoIWV4aXN0c1N5bmMocGFja2FnZURpcikpIHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiICYmIGlzRGV2T25seSkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIGAke2NoYWxrLnJlZChcIkVycm9yOlwiKX0gUGF0Y2ggZmlsZSBmb3VuZCBmb3IgcGFja2FnZSAke3Bvc2l4LmJhc2VuYW1lKFxuICAgICAgICBwYXRoU3BlY2lmaWVyLFxuICAgICAgKX1gICsgYCB3aGljaCBpcyBub3QgcHJlc2VudCBhdCAke3JlbGF0aXZlKFwiLlwiLCBwYWNrYWdlRGlyKX1gLFxuICAgIClcblxuICAgIGlmICghaXNEZXZPbmx5ICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIikge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgYFxuICBJZiB0aGlzIHBhY2thZ2UgaXMgYSBkZXYgZGVwZW5kZW5jeSwgcmVuYW1lIHRoZSBwYXRjaCBmaWxlIHRvXG4gIFxuICAgICR7Y2hhbGsuYm9sZChwYXRjaEZpbGVuYW1lLnJlcGxhY2UoXCIucGF0Y2hcIiwgXCIuZGV2LnBhdGNoXCIpKX1cbmAsXG4gICAgICApXG4gICAgfVxuXG4gICAgZXhpdCgpXG4gIH1cblxuICBjb25zdCB7IHZlcnNpb24gfSA9IHJlcXVpcmUoam9pbihwYWNrYWdlRGlyLCBcInBhY2thZ2UuanNvblwiKSlcbiAgLy8gbm9ybWFsaXplIHZlcnNpb24gZm9yIGBucG0gY2lgXG4gIGNvbnN0IHJlc3VsdCA9IHNlbXZlci52YWxpZCh2ZXJzaW9uKVxuICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIGAke2NoYWxrLnJlZChcbiAgICAgICAgXCJFcnJvcjpcIixcbiAgICAgICl9IFZlcnNpb24gc3RyaW5nICcke3ZlcnNpb259JyBjYW5ub3QgYmUgcGFyc2VkIGZyb20gJHtqb2luKFxuICAgICAgICBwYWNrYWdlRGlyLFxuICAgICAgICBcInBhY2thZ2UuanNvblwiLFxuICAgICAgKX1gLFxuICAgIClcblxuICAgIGV4aXQoKVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdCBhcyBzdHJpbmdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UGF0Y2hlc0ZvckFwcCh7XG4gIGFwcFBhdGgsXG4gIHJldmVyc2UsXG4gIHBhdGNoRGlyLFxufToge1xuICBhcHBQYXRoOiBzdHJpbmdcbiAgcmV2ZXJzZTogYm9vbGVhblxuICBwYXRjaERpcjogc3RyaW5nXG59KTogdm9pZCB7XG4gIGNvbnN0IHBhdGNoZXNEaXJlY3RvcnkgPSBqb2luKGFwcFBhdGgsIHBhdGNoRGlyKVxuICBjb25zdCBmaWxlcyA9IGZpbmRQYXRjaEZpbGVzKHBhdGNoZXNEaXJlY3RvcnkpXG5cbiAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKFwiTm8gcGF0Y2ggZmlsZXMgZm91bmRcIikpXG4gICAgcmV0dXJuXG4gIH1cblxuICBmaWxlcy5mb3JFYWNoKGZpbGVuYW1lID0+IHtcbiAgICBjb25zdCBwYWNrYWdlRGV0YWlscyA9IGdldFBhY2thZ2VEZXRhaWxzRnJvbVBhdGNoRmlsZW5hbWUoZmlsZW5hbWUpXG5cbiAgICBpZiAoIXBhY2thZ2VEZXRhaWxzKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFVucmVjb2duaXplZCBwYXRjaCBmaWxlIGluIHBhdGNoZXMgZGlyZWN0b3J5ICR7ZmlsZW5hbWV9YClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIG5hbWUsXG4gICAgICB2ZXJzaW9uLFxuICAgICAgcGF0aCxcbiAgICAgIHBhdGhTcGVjaWZpZXIsXG4gICAgICBpc0Rldk9ubHksXG4gICAgICBwYXRjaEZpbGVuYW1lLFxuICAgIH0gPSBwYWNrYWdlRGV0YWlsc1xuXG4gICAgY29uc3QgaW5zdGFsbGVkUGFja2FnZVZlcnNpb24gPSBnZXRJbnN0YWxsZWRQYWNrYWdlVmVyc2lvbih7XG4gICAgICBhcHBQYXRoLFxuICAgICAgcGF0aCxcbiAgICAgIHBhdGhTcGVjaWZpZXIsXG4gICAgICBpc0Rldk9ubHk6XG4gICAgICAgIGlzRGV2T25seSB8fFxuICAgICAgICAvLyBjaGVjayBmb3IgZGlyZWN0LWRlcGVuZGVudHMgaW4gcHJvZFxuICAgICAgICAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiICYmXG4gICAgICAgICAgcGFja2FnZUlzRGV2RGVwZW5kZW5jeSh7IGFwcFBhdGgsIHBhY2thZ2VEZXRhaWxzIH0pKSxcbiAgICAgIHBhdGNoRmlsZW5hbWUsXG4gICAgfSlcbiAgICBpZiAoIWluc3RhbGxlZFBhY2thZ2VWZXJzaW9uKSB7XG4gICAgICAvLyBpdCdzIG9rIHdlJ3JlIGluIHByb2R1Y3Rpb24gbW9kZSBhbmQgdGhpcyBpcyBhIGRldiBvbmx5IHBhY2thZ2VcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgU2tpcHBpbmcgZGV2LW9ubHkgJHtjaGFsay5ib2xkKHBhdGhTcGVjaWZpZXIpfUAke3ZlcnNpb259ICR7Y2hhbGsuYmx1ZShcbiAgICAgICAgICBcIuKclFwiLFxuICAgICAgICApfWAsXG4gICAgICApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBhcHBseVBhdGNoKHtcbiAgICAgICAgcGF0Y2hGaWxlUGF0aDogcmVzb2x2ZShwYXRjaGVzRGlyZWN0b3J5LCBmaWxlbmFtZSkgYXMgc3RyaW5nLFxuICAgICAgICByZXZlcnNlLFxuICAgICAgICBwYWNrYWdlRGV0YWlscyxcbiAgICAgICAgcGF0Y2hEaXIsXG4gICAgICB9KVxuICAgICkge1xuICAgICAgLy8geWF5IHBhdGNoIHdhcyBhcHBsaWVkIHN1Y2Nlc3NmdWxseVxuICAgICAgLy8gcHJpbnQgd2FybmluZyBpZiB2ZXJzaW9uIG1pc21hdGNoXG4gICAgICBpZiAoaW5zdGFsbGVkUGFja2FnZVZlcnNpb24gIT09IHZlcnNpb24pIHtcbiAgICAgICAgcHJpbnRWZXJzaW9uTWlzbWF0Y2hXYXJuaW5nKHtcbiAgICAgICAgICBwYWNrYWdlTmFtZTogbmFtZSxcbiAgICAgICAgICBhY3R1YWxWZXJzaW9uOiBpbnN0YWxsZWRQYWNrYWdlVmVyc2lvbixcbiAgICAgICAgICBvcmlnaW5hbFZlcnNpb246IHZlcnNpb24sXG4gICAgICAgICAgcGF0aFNwZWNpZmllcixcbiAgICAgICAgICBwYXRoLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgYCR7Y2hhbGsuYm9sZChwYXRoU3BlY2lmaWVyKX1AJHt2ZXJzaW9ufSAke2NoYWxrLmdyZWVuKFwi4pyUXCIpfWAsXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29tcGxldGVseSBmYWlsZWQgdG8gYXBwbHkgcGF0Y2hcbiAgICAgIC8vIFRPRE86IHByb3BhZ2F0ZSB1c2VmdWwgZXJyb3IgbWVzc2FnZXMgZnJvbSBwYXRjaCBhcHBsaWNhdGlvblxuICAgICAgaWYgKGluc3RhbGxlZFBhY2thZ2VWZXJzaW9uID09PSB2ZXJzaW9uKSB7XG4gICAgICAgIHByaW50QnJva2VuUGF0Y2hGaWxlRXJyb3Ioe1xuICAgICAgICAgIHBhY2thZ2VOYW1lOiBuYW1lLFxuICAgICAgICAgIHBhdGNoRmlsZU5hbWU6IGZpbGVuYW1lLFxuICAgICAgICAgIHBhdGhTcGVjaWZpZXIsXG4gICAgICAgICAgcGF0aCxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByaW50UGF0Y2hBcHBsaWN0aW9uRmFpbHVyZUVycm9yKHtcbiAgICAgICAgICBwYWNrYWdlTmFtZTogbmFtZSxcbiAgICAgICAgICBhY3R1YWxWZXJzaW9uOiBpbnN0YWxsZWRQYWNrYWdlVmVyc2lvbixcbiAgICAgICAgICBvcmlnaW5hbFZlcnNpb246IHZlcnNpb24sXG4gICAgICAgICAgcGF0Y2hGaWxlTmFtZTogZmlsZW5hbWUsXG4gICAgICAgICAgcGF0aCxcbiAgICAgICAgICBwYXRoU3BlY2lmaWVyLFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBleGl0KClcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBhdGNoKHtcbiAgcGF0Y2hGaWxlUGF0aCxcbiAgcmV2ZXJzZSxcbiAgcGFja2FnZURldGFpbHMsXG4gIHBhdGNoRGlyLFxufToge1xuICBwYXRjaEZpbGVQYXRoOiBzdHJpbmdcbiAgcmV2ZXJzZTogYm9vbGVhblxuICBwYWNrYWdlRGV0YWlsczogUGFja2FnZURldGFpbHNcbiAgcGF0Y2hEaXI6IHN0cmluZ1xufSk6IGJvb2xlYW4ge1xuICBjb25zdCBwYXRjaCA9IHJlYWRQYXRjaCh7IHBhdGNoRmlsZVBhdGgsIHBhY2thZ2VEZXRhaWxzLCBwYXRjaERpciB9KVxuICB0cnkge1xuICAgIGV4ZWN1dGVFZmZlY3RzKHJldmVyc2UgPyByZXZlcnNlUGF0Y2gocGF0Y2gpIDogcGF0Y2gsIHsgZHJ5UnVuOiBmYWxzZSB9KVxuICB9IGNhdGNoIChlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWN1dGVFZmZlY3RzKHJldmVyc2UgPyBwYXRjaCA6IHJldmVyc2VQYXRjaChwYXRjaCksIHsgZHJ5UnVuOiB0cnVlIH0pXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gcHJpbnRWZXJzaW9uTWlzbWF0Y2hXYXJuaW5nKHtcbiAgcGFja2FnZU5hbWUsXG4gIGFjdHVhbFZlcnNpb24sXG4gIG9yaWdpbmFsVmVyc2lvbixcbiAgcGF0aFNwZWNpZmllcixcbiAgcGF0aCxcbn06IHtcbiAgcGFja2FnZU5hbWU6IHN0cmluZ1xuICBhY3R1YWxWZXJzaW9uOiBzdHJpbmdcbiAgb3JpZ2luYWxWZXJzaW9uOiBzdHJpbmdcbiAgcGF0aFNwZWNpZmllcjogc3RyaW5nXG4gIHBhdGg6IHN0cmluZ1xufSkge1xuICBjb25zb2xlLndhcm4oYFxuJHtjaGFsay5yZWQoXCJXYXJuaW5nOlwiKX0gcGF0Y2gtcGFja2FnZSBkZXRlY3RlZCBhIHBhdGNoIGZpbGUgdmVyc2lvbiBtaXNtYXRjaFxuXG4gIERvbid0IHdvcnJ5ISBUaGlzIGlzIHByb2JhYmx5IGZpbmUuIFRoZSBwYXRjaCB3YXMgc3RpbGwgYXBwbGllZFxuICBzdWNjZXNzZnVsbHkuIEhlcmUncyB0aGUgZGVldHM6XG5cbiAgUGF0Y2ggZmlsZSBjcmVhdGVkIGZvclxuXG4gICAgJHtwYWNrYWdlTmFtZX1AJHtjaGFsay5ib2xkKG9yaWdpbmFsVmVyc2lvbil9XG5cbiAgYXBwbGllZCB0b1xuXG4gICAgJHtwYWNrYWdlTmFtZX1AJHtjaGFsay5ib2xkKGFjdHVhbFZlcnNpb24pfVxuICBcbiAgQXQgcGF0aFxuICBcbiAgICAke3BhdGh9XG5cbiAgVGhpcyB3YXJuaW5nIGlzIGp1c3QgdG8gZ2l2ZSB5b3UgYSBoZWFkcy11cC4gVGhlcmUgaXMgYSBzbWFsbCBjaGFuY2Ugb2ZcbiAgYnJlYWthZ2UgZXZlbiB0aG91Z2ggdGhlIHBhdGNoIHdhcyBhcHBsaWVkIHN1Y2Nlc3NmdWxseS4gTWFrZSBzdXJlIHRoZSBwYWNrYWdlXG4gIHN0aWxsIGJlaGF2ZXMgbGlrZSB5b3UgZXhwZWN0ICh5b3Ugd3JvdGUgdGVzdHMsIHJpZ2h0PykgYW5kIHRoZW4gcnVuXG5cbiAgICAke2NoYWxrLmJvbGQoYHBhdGNoLXBhY2thZ2UgJHtwYXRoU3BlY2lmaWVyfWApfVxuXG4gIHRvIHVwZGF0ZSB0aGUgdmVyc2lvbiBpbiB0aGUgcGF0Y2ggZmlsZSBuYW1lIGFuZCBtYWtlIHRoaXMgd2FybmluZyBnbyBhd2F5LlxuYClcbn1cblxuZnVuY3Rpb24gcHJpbnRCcm9rZW5QYXRjaEZpbGVFcnJvcih7XG4gIHBhY2thZ2VOYW1lLFxuICBwYXRjaEZpbGVOYW1lLFxuICBwYXRoLFxuICBwYXRoU3BlY2lmaWVyLFxufToge1xuICBwYWNrYWdlTmFtZTogc3RyaW5nXG4gIHBhdGNoRmlsZU5hbWU6IHN0cmluZ1xuICBwYXRoOiBzdHJpbmdcbiAgcGF0aFNwZWNpZmllcjogc3RyaW5nXG59KSB7XG4gIGNvbnNvbGUuZXJyb3IoYFxuJHtjaGFsay5yZWQuYm9sZChcIioqRVJST1IqKlwiKX0gJHtjaGFsay5yZWQoXG4gICAgYEZhaWxlZCB0byBhcHBseSBwYXRjaCBmb3IgcGFja2FnZSAke2NoYWxrLmJvbGQocGFja2FnZU5hbWUpfSBhdCBwYXRoYCxcbiAgKX1cbiAgXG4gICAgJHtwYXRofVxuXG4gIFRoaXMgZXJyb3Igd2FzIGNhdXNlZCBiZWNhdXNlIHBhdGNoLXBhY2thZ2UgY2Fubm90IGFwcGx5IHRoZSBmb2xsb3dpbmcgcGF0Y2ggZmlsZTpcblxuICAgIHBhdGNoZXMvJHtwYXRjaEZpbGVOYW1lfVxuXG4gIFRyeSByZW1vdmluZyBub2RlX21vZHVsZXMgYW5kIHRyeWluZyBhZ2Fpbi4gSWYgdGhhdCBkb2Vzbid0IHdvcmssIG1heWJlIHRoZXJlIHdhc1xuICBhbiBhY2NpZGVudGFsIGNoYW5nZSBtYWRlIHRvIHRoZSBwYXRjaCBmaWxlPyBUcnkgcmVjcmVhdGluZyBpdCBieSBtYW51YWxseVxuICBlZGl0aW5nIHRoZSBhcHByb3ByaWF0ZSBmaWxlcyBhbmQgcnVubmluZzpcbiAgXG4gICAgcGF0Y2gtcGFja2FnZSAke3BhdGhTcGVjaWZpZXJ9XG4gIFxuICBJZiB0aGF0IGRvZXNuJ3Qgd29yaywgdGhlbiBpdCdzIGEgYnVnIGluIHBhdGNoLXBhY2thZ2UsIHNvIHBsZWFzZSBzdWJtaXQgYSBidWdcbiAgcmVwb3J0LiBUaGFua3MhXG5cbiAgICBodHRwczovL2dpdGh1Yi5jb20vZHMzMDAvcGF0Y2gtcGFja2FnZS9pc3N1ZXNcbiAgICBcbmApXG59XG5cbmZ1bmN0aW9uIHByaW50UGF0Y2hBcHBsaWN0aW9uRmFpbHVyZUVycm9yKHtcbiAgcGFja2FnZU5hbWUsXG4gIGFjdHVhbFZlcnNpb24sXG4gIG9yaWdpbmFsVmVyc2lvbixcbiAgcGF0Y2hGaWxlTmFtZSxcbiAgcGF0aCxcbiAgcGF0aFNwZWNpZmllcixcbn06IHtcbiAgcGFja2FnZU5hbWU6IHN0cmluZ1xuICBhY3R1YWxWZXJzaW9uOiBzdHJpbmdcbiAgb3JpZ2luYWxWZXJzaW9uOiBzdHJpbmdcbiAgcGF0Y2hGaWxlTmFtZTogc3RyaW5nXG4gIHBhdGg6IHN0cmluZ1xuICBwYXRoU3BlY2lmaWVyOiBzdHJpbmdcbn0pIHtcbiAgY29uc29sZS5lcnJvcihgXG4ke2NoYWxrLnJlZC5ib2xkKFwiKipFUlJPUioqXCIpfSAke2NoYWxrLnJlZChcbiAgICBgRmFpbGVkIHRvIGFwcGx5IHBhdGNoIGZvciBwYWNrYWdlICR7Y2hhbGsuYm9sZChwYWNrYWdlTmFtZSl9IGF0IHBhdGhgLFxuICApfVxuICBcbiAgICAke3BhdGh9XG5cbiAgVGhpcyBlcnJvciB3YXMgY2F1c2VkIGJlY2F1c2UgJHtjaGFsay5ib2xkKHBhY2thZ2VOYW1lKX0gaGFzIGNoYW5nZWQgc2luY2UgeW91XG4gIG1hZGUgdGhlIHBhdGNoIGZpbGUgZm9yIGl0LiBUaGlzIGludHJvZHVjZWQgY29uZmxpY3RzIHdpdGggeW91ciBwYXRjaCxcbiAganVzdCBsaWtlIGEgbWVyZ2UgY29uZmxpY3QgaW4gR2l0IHdoZW4gc2VwYXJhdGUgaW5jb21wYXRpYmxlIGNoYW5nZXMgYXJlXG4gIG1hZGUgdG8gdGhlIHNhbWUgcGllY2Ugb2YgY29kZS5cblxuICBNYXliZSB0aGlzIG1lYW5zIHlvdXIgcGF0Y2ggZmlsZSBpcyBubyBsb25nZXIgbmVjZXNzYXJ5LCBpbiB3aGljaCBjYXNlXG4gIGhvb3JheSEgSnVzdCBkZWxldGUgaXQhXG5cbiAgT3RoZXJ3aXNlLCB5b3UgbmVlZCB0byBnZW5lcmF0ZSBhIG5ldyBwYXRjaCBmaWxlLlxuXG4gIFRvIGdlbmVyYXRlIGEgbmV3IG9uZSwganVzdCByZXBlYXQgdGhlIHN0ZXBzIHlvdSBtYWRlIHRvIGdlbmVyYXRlIHRoZSBmaXJzdFxuICBvbmUuXG5cbiAgaS5lLiBtYW51YWxseSBtYWtlIHRoZSBhcHByb3ByaWF0ZSBmaWxlIGNoYW5nZXMsIHRoZW4gcnVuIFxuXG4gICAgcGF0Y2gtcGFja2FnZSAke3BhdGhTcGVjaWZpZXJ9XG5cbiAgSW5mbzpcbiAgICBQYXRjaCBmaWxlOiBwYXRjaGVzLyR7cGF0Y2hGaWxlTmFtZX1cbiAgICBQYXRjaCB3YXMgbWFkZSBmb3IgdmVyc2lvbjogJHtjaGFsay5ncmVlbi5ib2xkKG9yaWdpbmFsVmVyc2lvbil9XG4gICAgSW5zdGFsbGVkIHZlcnNpb246ICR7Y2hhbGsucmVkLmJvbGQoYWN0dWFsVmVyc2lvbil9XG5gKVxufVxuIl19