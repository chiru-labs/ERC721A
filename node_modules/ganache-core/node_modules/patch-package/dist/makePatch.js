"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var path_1 = require("./path");
var spawnSafe_1 = require("./spawnSafe");
var filterFiles_1 = require("./filterFiles");
var fs_extra_1 = require("fs-extra");
var rimraf_1 = require("rimraf");
var fs_extra_2 = require("fs-extra");
var tmp_1 = require("tmp");
var patchFs_1 = require("./patchFs");
var PackageDetails_1 = require("./PackageDetails");
var resolveRelativeFileDependencies_1 = require("./resolveRelativeFileDependencies");
var getPackageResolution_1 = require("./getPackageResolution");
var parse_1 = require("./patch/parse");
var zlib_1 = require("zlib");
function printNoPackageFoundError(packageName, packageJsonPath) {
    console.error("No such package " + packageName + "\n\n  File not found: " + packageJsonPath);
}
function makePatch(_a) {
    var _b;
    var packagePathSpecifier = _a.packagePathSpecifier, appPath = _a.appPath, packageManager = _a.packageManager, includePaths = _a.includePaths, excludePaths = _a.excludePaths, patchDir = _a.patchDir;
    var packageDetails = PackageDetails_1.getPatchDetailsFromCliString(packagePathSpecifier);
    if (!packageDetails) {
        console.error("No such package", packagePathSpecifier);
        return;
    }
    var appPackageJson = require(path_1.join(appPath, "package.json"));
    var packagePath = path_1.join(appPath, packageDetails.path);
    var packageJsonPath = path_1.join(packagePath, "package.json");
    if (!fs_extra_1.existsSync(packageJsonPath)) {
        printNoPackageFoundError(packagePathSpecifier, packageJsonPath);
        process.exit(1);
    }
    var tmpRepo = tmp_1.dirSync({ unsafeCleanup: true });
    var tmpRepoPackagePath = path_1.join(tmpRepo.name, packageDetails.path);
    var tmpRepoNpmRoot = tmpRepoPackagePath.slice(0, -("/node_modules/" + packageDetails.name).length);
    var tmpRepoPackageJsonPath = path_1.join(tmpRepoNpmRoot, "package.json");
    try {
        var patchesDir = path_1.resolve(path_1.join(appPath, patchDir));
        console.info(chalk_1.default.grey("•"), "Creating temporary folder");
        // make a blank package.json
        fs_extra_1.mkdirpSync(tmpRepoNpmRoot);
        fs_extra_1.writeFileSync(tmpRepoPackageJsonPath, JSON.stringify({
            dependencies: (_b = {},
                _b[packageDetails.name] = getPackageResolution_1.getPackageResolution({
                    packageDetails: packageDetails,
                    packageManager: packageManager,
                    appPath: appPath,
                }),
                _b),
            resolutions: resolveRelativeFileDependencies_1.resolveRelativeFileDependencies(appPath, appPackageJson.resolutions || {}),
        }));
        var packageVersion = require(path_1.join(path_1.resolve(packageDetails.path), "package.json")).version;
        // copy .npmrc/.yarnrc in case packages are hosted in private registry
        [".npmrc", ".yarnrc"].forEach(function (rcFile) {
            var rcPath = path_1.join(appPath, rcFile);
            if (fs_extra_1.existsSync(rcPath)) {
                fs_extra_2.copySync(rcPath, path_1.join(tmpRepo.name, rcFile));
            }
        });
        if (packageManager === "yarn") {
            console.info(chalk_1.default.grey("•"), "Installing " + packageDetails.name + "@" + packageVersion + " with yarn");
            try {
                // try first without ignoring scripts in case they are required
                // this works in 99.99% of cases
                spawnSafe_1.spawnSafeSync("yarn", ["install", "--ignore-engines"], {
                    cwd: tmpRepoNpmRoot,
                    logStdErrOnError: false,
                });
            }
            catch (e) {
                // try again while ignoring scripts in case the script depends on
                // an implicit context which we havn't reproduced
                spawnSafe_1.spawnSafeSync("yarn", ["install", "--ignore-engines", "--ignore-scripts"], {
                    cwd: tmpRepoNpmRoot,
                });
            }
        }
        else {
            console.info(chalk_1.default.grey("•"), "Installing " + packageDetails.name + "@" + packageVersion + " with npm");
            try {
                // try first without ignoring scripts in case they are required
                // this works in 99.99% of cases
                spawnSafe_1.spawnSafeSync("npm", ["i"], {
                    cwd: tmpRepoNpmRoot,
                    logStdErrOnError: false,
                });
            }
            catch (e) {
                // try again while ignoring scripts in case the script depends on
                // an implicit context which we havn't reproduced
                spawnSafe_1.spawnSafeSync("npm", ["i", "--ignore-scripts"], {
                    cwd: tmpRepoNpmRoot,
                });
            }
        }
        var git = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return spawnSafe_1.spawnSafeSync("git", args, {
                cwd: tmpRepo.name,
                env: { HOME: tmpRepo.name },
            });
        };
        // remove nested node_modules just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // remove .git just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // commit the package
        console.info(chalk_1.default.grey("•"), "Diffing your files with clean files");
        fs_extra_1.writeFileSync(path_1.join(tmpRepo.name, ".gitignore"), "!/node_modules\n\n");
        git("init");
        git("config", "--local", "user.name", "patch-package");
        git("config", "--local", "user.email", "patch@pack.age");
        // remove ignored files first
        filterFiles_1.removeIgnoredFiles(tmpRepoPackagePath, includePaths, excludePaths);
        git("add", "-f", packageDetails.path);
        git("commit", "--allow-empty", "-m", "init");
        // replace package with user's version
        rimraf_1.sync(tmpRepoPackagePath);
        fs_extra_2.copySync(packagePath, tmpRepoPackagePath);
        // remove nested node_modules just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // remove .git just to be safe
        rimraf_1.sync(path_1.join(tmpRepoPackagePath, "node_modules"));
        // also remove ignored files like before
        filterFiles_1.removeIgnoredFiles(tmpRepoPackagePath, includePaths, excludePaths);
        // stage all files
        git("add", "-f", packageDetails.path);
        // get diff of changes
        var diffResult = git("diff", "--cached", "--no-color", "--ignore-space-at-eol", "--no-ext-diff");
        if (diffResult.stdout.length === 0) {
            console.warn("\u2049\uFE0F  Not creating patch file for package '" + packagePathSpecifier + "'");
            console.warn("\u2049\uFE0F  There don't appear to be any changes.");
            process.exit(1);
            return;
        }
        try {
            parse_1.parsePatchFile(diffResult.stdout.toString());
        }
        catch (e) {
            if (e.message.includes("Unexpected file mode string: 120000")) {
                console.error("\n\u26D4\uFE0F " + chalk_1.default.red.bold("ERROR") + "\n\n  Your changes involve creating symlinks. patch-package does not yet support\n  symlinks.\n  \n  \uFE0FPlease use " + chalk_1.default.bold("--include") + " and/or " + chalk_1.default.bold("--exclude") + " to narrow the scope of your patch if\n  this was unintentional.\n");
            }
            else {
                var outPath = "./patch-package-error.json.gz";
                fs_extra_1.writeFileSync(outPath, zlib_1.gzipSync(JSON.stringify({
                    error: { message: e.message, stack: e.stack },
                    patch: diffResult.stdout.toString(),
                })));
                console.error("\n\u26D4\uFE0F " + chalk_1.default.red.bold("ERROR") + "\n        \n  patch-package was unable to read the patch-file made by git. This should not\n  happen.\n  \n  A diagnostic file was written to\n  \n    " + outPath + "\n  \n  Please attach it to a github issue\n  \n    https://github.com/ds300/patch-package/issues/new?title=New+patch+parse+failed&body=Please+attach+the+diagnostic+file+by+dragging+it+into+here+\uD83D\uDE4F\n  \n  Note that this diagnostic file will contain code from the package you were\n  attempting to patch.\n\n");
            }
            process.exit(1);
            return;
        }
        var packageNames = packageDetails.packageNames
            .map(function (name) { return name.replace(/\//g, "+"); })
            .join("++");
        // maybe delete existing
        patchFs_1.getPatchFiles(patchDir).forEach(function (filename) {
            var deets = PackageDetails_1.getPackageDetailsFromPatchFilename(filename);
            if (deets && deets.path === packageDetails.path) {
                fs_extra_1.unlinkSync(path_1.join(patchDir, filename));
            }
        });
        var patchFileName = packageNames + "+" + packageVersion + ".patch";
        var patchPath = path_1.join(patchesDir, patchFileName);
        if (!fs_extra_1.existsSync(path_1.dirname(patchPath))) {
            // scoped package
            fs_extra_1.mkdirSync(path_1.dirname(patchPath));
        }
        fs_extra_1.writeFileSync(patchPath, diffResult.stdout);
        console.log(chalk_1.default.green("✔") + " Created file " + path_1.join(patchDir, patchFileName));
    }
    catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        tmpRepo.removeCallback();
    }
}
exports.makePatch = makePatch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZVBhdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21ha2VQYXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdEQUF5QjtBQUN6QiwrQkFBK0M7QUFDL0MseUNBQTJDO0FBRTNDLDZDQUFrRDtBQUNsRCxxQ0FNaUI7QUFDakIsaUNBQXVDO0FBQ3ZDLHFDQUFtQztBQUNuQywyQkFBNkI7QUFDN0IscUNBQXlDO0FBQ3pDLG1EQUd5QjtBQUN6QixxRkFBbUY7QUFDbkYsK0RBQTZEO0FBQzdELHVDQUE4QztBQUM5Qyw2QkFBK0I7QUFFL0IsU0FBUyx3QkFBd0IsQ0FDL0IsV0FBbUIsRUFDbkIsZUFBdUI7SUFFdkIsT0FBTyxDQUFDLEtBQUssQ0FDWCxxQkFBbUIsV0FBVyw4QkFFZCxlQUFpQixDQUNsQyxDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxFQWN6Qjs7UUFiQyw4Q0FBb0IsRUFDcEIsb0JBQU8sRUFDUCxrQ0FBYyxFQUNkLDhCQUFZLEVBQ1osOEJBQVksRUFDWixzQkFBUTtJQVNSLElBQU0sY0FBYyxHQUFHLDZDQUE0QixDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFFekUsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNuQixPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLG9CQUFvQixDQUFDLENBQUE7UUFDdEQsT0FBTTtLQUNQO0lBQ0QsSUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFdBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQTtJQUM3RCxJQUFNLFdBQVcsR0FBRyxXQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN0RCxJQUFNLGVBQWUsR0FBRyxXQUFJLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFBO0lBRXpELElBQUksQ0FBQyxxQkFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFO1FBQ2hDLHdCQUF3QixDQUFD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bGsgZnJvbSBcImNoYWxrXCJcbmltcG9ydCB7IGpvaW4sIGRpcm5hbWUsIHJlc29sdmUgfSBmcm9tIFwiLi9wYXRoXCJcbmltcG9ydCB7IHNwYXduU2FmZVN5bmMgfSBmcm9tIFwiLi9zcGF3blNhZmVcIlxuaW1wb3J0IHsgUGFja2FnZU1hbmFnZXIgfSBmcm9tIFwiLi9kZXRlY3RQYWNrYWdlTWFuYWdlclwiXG5pbXBvcnQgeyByZW1vdmVJZ25vcmVkRmlsZXMgfSBmcm9tIFwiLi9maWx0ZXJGaWxlc1wiXG5pbXBvcnQge1xuICB3cml0ZUZpbGVTeW5jLFxuICBleGlzdHNTeW5jLFxuICBta2RpclN5bmMsXG4gIHVubGlua1N5bmMsXG4gIG1rZGlycFN5bmMsXG59IGZyb20gXCJmcy1leHRyYVwiXG5pbXBvcnQgeyBzeW5jIGFzIHJpbXJhZiB9IGZyb20gXCJyaW1yYWZcIlxuaW1wb3J0IHsgY29weVN5bmMgfSBmcm9tIFwiZnMtZXh0cmFcIlxuaW1wb3J0IHsgZGlyU3luYyB9IGZyb20gXCJ0bXBcIlxuaW1wb3J0IHsgZ2V0UGF0Y2hGaWxlcyB9IGZyb20gXCIuL3BhdGNoRnNcIlxuaW1wb3J0IHtcbiAgZ2V0UGF0Y2hEZXRhaWxzRnJvbUNsaVN0cmluZyxcbiAgZ2V0UGFja2FnZURldGFpbHNGcm9tUGF0Y2hGaWxlbmFtZSxcbn0gZnJvbSBcIi4vUGFja2FnZURldGFpbHNcIlxuaW1wb3J0IHsgcmVzb2x2ZVJlbGF0aXZlRmlsZURlcGVuZGVuY2llcyB9IGZyb20gXCIuL3Jlc29sdmVSZWxhdGl2ZUZpbGVEZXBlbmRlbmNpZXNcIlxuaW1wb3J0IHsgZ2V0UGFja2FnZVJlc29sdXRpb24gfSBmcm9tIFwiLi9nZXRQYWNrYWdlUmVzb2x1dGlvblwiXG5pbXBvcnQgeyBwYXJzZVBhdGNoRmlsZSB9IGZyb20gXCIuL3BhdGNoL3BhcnNlXCJcbmltcG9ydCB7IGd6aXBTeW5jIH0gZnJvbSBcInpsaWJcIlxuXG5mdW5jdGlvbiBwcmludE5vUGFja2FnZUZvdW5kRXJyb3IoXG4gIHBhY2thZ2VOYW1lOiBzdHJpbmcsXG4gIHBhY2thZ2VKc29uUGF0aDogc3RyaW5nLFxuKSB7XG4gIGNvbnNvbGUuZXJyb3IoXG4gICAgYE5vIHN1Y2ggcGFja2FnZSAke3BhY2thZ2VOYW1lfVxuXG4gIEZpbGUgbm90IGZvdW5kOiAke3BhY2thZ2VKc29uUGF0aH1gLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUGF0Y2goe1xuICBwYWNrYWdlUGF0aFNwZWNpZmllcixcbiAgYXBwUGF0aCxcbiAgcGFja2FnZU1hbmFnZXIsXG4gIGluY2x1ZGVQYXRocyxcbiAgZXhjbHVkZVBhdGhzLFxuICBwYXRjaERpcixcbn06IHtcbiAgcGFja2FnZVBhdGhTcGVjaWZpZXI6IHN0cmluZ1xuICBhcHBQYXRoOiBzdHJpbmdcbiAgcGFja2FnZU1hbmFnZXI6IFBhY2thZ2VNYW5hZ2VyXG4gIGluY2x1ZGVQYXRoczogUmVnRXhwXG4gIGV4Y2x1ZGVQYXRoczogUmVnRXhwXG4gIHBhdGNoRGlyOiBzdHJpbmdcbn0pIHtcbiAgY29uc3QgcGFja2FnZURldGFpbHMgPSBnZXRQYXRjaERldGFpbHNGcm9tQ2xpU3RyaW5nKHBhY2thZ2VQYXRoU3BlY2lmaWVyKVxuXG4gIGlmICghcGFja2FnZURldGFpbHMpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiTm8gc3VjaCBwYWNrYWdlXCIsIHBhY2thZ2VQYXRoU3BlY2lmaWVyKVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGFwcFBhY2thZ2VKc29uID0gcmVxdWlyZShqb2luKGFwcFBhdGgsIFwicGFja2FnZS5qc29uXCIpKVxuICBjb25zdCBwYWNrYWdlUGF0aCA9IGpvaW4oYXBwUGF0aCwgcGFja2FnZURldGFpbHMucGF0aClcbiAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gam9pbihwYWNrYWdlUGF0aCwgXCJwYWNrYWdlLmpzb25cIilcblxuICBpZiAoIWV4aXN0c1N5bmMocGFja2FnZUpzb25QYXRoKSkge1xuICAgIHByaW50Tm9QYWNrYWdlRm91bmRFcnJvcihwYWNrYWdlUGF0aFNwZWNpZmllciwgcGFja2FnZUpzb25QYXRoKVxuICAgIHByb2Nlc3MuZXhpdCgxKVxuICB9XG5cbiAgY29uc3QgdG1wUmVwbyA9IGRpclN5bmMoeyB1bnNhZmVDbGVhbnVwOiB0cnVlIH0pXG4gIGNvbnN0IHRtcFJlcG9QYWNrYWdlUGF0aCA9IGpvaW4odG1wUmVwby5uYW1lLCBwYWNrYWdlRGV0YWlscy5wYXRoKVxuICBjb25zdCB0bXBSZXBvTnBtUm9vdCA9IHRtcFJlcG9QYWNrYWdlUGF0aC5zbGljZShcbiAgICAwLFxuICAgIC1gL25vZGVfbW9kdWxlcy8ke3BhY2thZ2VEZXRhaWxzLm5hbWV9YC5sZW5ndGgsXG4gIClcblxuICBjb25zdCB0bXBSZXBvUGFja2FnZUpzb25QYXRoID0gam9pbih0bXBSZXBvTnBtUm9vdCwgXCJwYWNrYWdlLmpzb25cIilcblxuICB0cnkge1xuICAgIGNvbnN0IHBhdGNoZXNEaXIgPSByZXNvbHZlKGpvaW4oYXBwUGF0aCwgcGF0Y2hEaXIpKVxuXG4gICAgY29uc29sZS5pbmZvKGNoYWxrLmdyZXkoXCLigKJcIiksIFwiQ3JlYXRpbmcgdGVtcG9yYXJ5IGZvbGRlclwiKVxuXG4gICAgLy8gbWFrZSBhIGJsYW5rIHBhY2thZ2UuanNvblxuICAgIG1rZGlycFN5bmModG1wUmVwb05wbVJvb3QpXG4gICAgd3JpdGVGaWxlU3luYyhcbiAgICAgIHRtcFJlcG9QYWNrYWdlSnNvblBhdGgsXG4gICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGRlcGVuZGVuY2llczoge1xuICAgICAgICAgIFtwYWNrYWdlRGV0YWlscy5uYW1lXTogZ2V0UGFja2FnZVJlc29sdXRpb24oe1xuICAgICAgICAgICAgcGFja2FnZURldGFpbHMsXG4gICAgICAgICAgICBwYWNrYWdlTWFuYWdlcixcbiAgICAgICAgICAgIGFwcFBhdGgsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdXRpb25zOiByZXNvbHZlUmVsYXRpdmVGaWxlRGVwZW5kZW5jaWVzKFxuICAgICAgICAgIGFwcFBhdGgsXG4gICAgICAgICAgYXBwUGFja2FnZUpzb24ucmVzb2x1dGlvbnMgfHwge30sXG4gICAgICAgICksXG4gICAgICB9KSxcbiAgICApXG5cbiAgICBjb25zdCBwYWNrYWdlVmVyc2lvbiA9IHJlcXVpcmUoam9pbihcbiAgICAgIHJlc29sdmUocGFja2FnZURldGFpbHMucGF0aCksXG4gICAgICBcInBhY2thZ2UuanNvblwiLFxuICAgICkpLnZlcnNpb24gYXMgc3RyaW5nXG5cbiAgICAvLyBjb3B5IC5ucG1yYy8ueWFybnJjIGluIGNhc2UgcGFja2FnZXMgYXJlIGhvc3RlZCBpbiBwcml2YXRlIHJlZ2lzdHJ5XG4gICAgW1wiLm5wbXJjXCIsIFwiLnlhcm5yY1wiXS5mb3JFYWNoKHJjRmlsZSA9PiB7XG4gICAgICBjb25zdCByY1BhdGggPSBqb2luKGFwcFBhdGgsIHJjRmlsZSlcbiAgICAgIGlmIChleGlzdHNTeW5jKHJjUGF0aCkpIHtcbiAgICAgICAgY29weVN5bmMocmNQYXRoLCBqb2luKHRtcFJlcG8ubmFtZSwgcmNGaWxlKSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHBhY2thZ2VNYW5hZ2VyID09PSBcInlhcm5cIikge1xuICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICBjaGFsay5ncmV5KFwi4oCiXCIpLFxuICAgICAgICBgSW5zdGFsbGluZyAke3BhY2thZ2VEZXRhaWxzLm5hbWV9QCR7cGFja2FnZVZlcnNpb259IHdpdGggeWFybmAsXG4gICAgICApXG4gICAgICB0cnkge1xuICAgICAgICAvLyB0cnkgZmlyc3Qgd2l0aG91dCBpZ25vcmluZyBzY3JpcHRzIGluIGNhc2UgdGhleSBhcmUgcmVxdWlyZWRcbiAgICAgICAgLy8gdGhpcyB3b3JrcyBpbiA5OS45OSUgb2YgY2FzZXNcbiAgICAgICAgc3Bhd25TYWZlU3luYyhgeWFybmAsIFtcImluc3RhbGxcIiwgXCItLWlnbm9yZS1lbmdpbmVzXCJdLCB7XG4gICAgICAgICAgY3dkOiB0bXBSZXBvTnBtUm9vdCxcbiAgICAgICAgICBsb2dTdGRFcnJPbkVycm9yOiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gdHJ5IGFnYWluIHdoaWxlIGlnbm9yaW5nIHNjcmlwdHMgaW4gY2FzZSB0aGUgc2NyaXB0IGRlcGVuZHMgb25cbiAgICAgICAgLy8gYW4gaW1wbGljaXQgY29udGV4dCB3aGljaCB3ZSBoYXZuJ3QgcmVwcm9kdWNlZFxuICAgICAgICBzcGF3blNhZmVTeW5jKFxuICAgICAgICAgIGB5YXJuYCxcbiAgICAgICAgICBbXCJpbnN0YWxsXCIsIFwiLS1pZ25vcmUtZW5naW5lc1wiLCBcIi0taWdub3JlLXNjcmlwdHNcIl0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY3dkOiB0bXBSZXBvTnBtUm9vdCxcbiAgICAgICAgICB9LFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgY2hhbGsuZ3JleShcIuKAolwiKSxcbiAgICAgICAgYEluc3RhbGxpbmcgJHtwYWNrYWdlRGV0YWlscy5uYW1lfUAke3BhY2thZ2VWZXJzaW9ufSB3aXRoIG5wbWAsXG4gICAgICApXG4gICAgICB0cnkge1xuICAgICAgICAvLyB0cnkgZmlyc3Qgd2l0aG91dCBpZ25vcmluZyBzY3JpcHRzIGluIGNhc2UgdGhleSBhcmUgcmVxdWlyZWRcbiAgICAgICAgLy8gdGhpcyB3b3JrcyBpbiA5OS45OSUgb2YgY2FzZXNcbiAgICAgICAgc3Bhd25TYWZlU3luYyhgbnBtYCwgW1wiaVwiXSwge1xuICAgICAgICAgIGN3ZDogdG1wUmVwb05wbVJvb3QsXG4gICAgICAgICAgbG9nU3RkRXJyT25FcnJvcjogZmFsc2UsXG4gICAgICAgIH0pXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIHRyeSBhZ2FpbiB3aGlsZSBpZ25vcmluZyBzY3JpcHRzIGluIGNhc2UgdGhlIHNjcmlwdCBkZXBlbmRzIG9uXG4gICAgICAgIC8vIGFuIGltcGxpY2l0IGNvbnRleHQgd2hpY2ggd2UgaGF2bid0IHJlcHJvZHVjZWRcbiAgICAgICAgc3Bhd25TYWZlU3luYyhgbnBtYCwgW1wiaVwiLCBcIi0taWdub3JlLXNjcmlwdHNcIl0sIHtcbiAgICAgICAgICBjd2Q6IHRtcFJlcG9OcG1Sb290LFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGdpdCA9ICguLi5hcmdzOiBzdHJpbmdbXSkgPT5cbiAgICAgIHNwYXduU2FmZVN5bmMoXCJnaXRcIiwgYXJncywge1xuICAgICAgICBjd2Q6IHRtcFJlcG8ubmFtZSxcbiAgICAgICAgZW52OiB7IEhPTUU6IHRtcFJlcG8ubmFtZSB9LFxuICAgICAgfSlcblxuICAgIC8vIHJlbW92ZSBuZXN0ZWQgbm9kZV9tb2R1bGVzIGp1c3QgdG8gYmUgc2FmZVxuICAgIHJpbXJhZihqb2luKHRtcFJlcG9QYWNrYWdlUGF0aCwgXCJub2RlX21vZHVsZXNcIikpXG4gICAgLy8gcmVtb3ZlIC5naXQganVzdCB0byBiZSBzYWZlXG4gICAgcmltcmFmKGpvaW4odG1wUmVwb1BhY2thZ2VQYXRoLCBcIm5vZGVfbW9kdWxlc1wiKSlcblxuICAgIC8vIGNvbW1pdCB0aGUgcGFja2FnZVxuICAgIGNvbnNvbGUuaW5mbyhjaGFsay5ncmV5KFwi4oCiXCIpLCBcIkRpZmZpbmcgeW91ciBmaWxlcyB3aXRoIGNsZWFuIGZpbGVzXCIpXG4gICAgd3JpdGVGaWxlU3luYyhqb2luKHRtcFJlcG8ubmFtZSwgXCIuZ2l0aWdub3JlXCIpLCBcIiEvbm9kZV9tb2R1bGVzXFxuXFxuXCIpXG4gICAgZ2l0KFwiaW5pdFwiKVxuICAgIGdpdChcImNvbmZpZ1wiLCBcIi0tbG9jYWxcIiwgXCJ1c2VyLm5hbWVcIiwgXCJwYXRjaC1wYWNrYWdlXCIpXG4gICAgZ2l0KFwiY29uZmlnXCIsIFwiLS1sb2NhbFwiLCBcInVzZXIuZW1haWxcIiwgXCJwYXRjaEBwYWNrLmFnZVwiKVxuXG4gICAgLy8gcmVtb3ZlIGlnbm9yZWQgZmlsZXMgZmlyc3RcbiAgICByZW1vdmVJZ25vcmVkRmlsZXModG1wUmVwb1BhY2thZ2VQYXRoLCBpbmNsdWRlUGF0aHMsIGV4Y2x1ZGVQYXRocylcblxuICAgIGdpdChcImFkZFwiLCBcIi1mXCIsIHBhY2thZ2VEZXRhaWxzLnBhdGgpXG4gICAgZ2l0KFwiY29tbWl0XCIsIFwiLS1hbGxvdy1lbXB0eVwiLCBcIi1tXCIsIFwiaW5pdFwiKVxuXG4gICAgLy8gcmVwbGFjZSBwYWNrYWdlIHdpdGggdXNlcidzIHZlcnNpb25cbiAgICByaW1yYWYodG1wUmVwb1BhY2thZ2VQYXRoKVxuXG4gICAgY29weVN5bmMocGFja2FnZVBhdGgsIHRtcFJlcG9QYWNrYWdlUGF0aClcblxuICAgIC8vIHJlbW92ZSBuZXN0ZWQgbm9kZV9tb2R1bGVzIGp1c3QgdG8gYmUgc2FmZVxuICAgIHJpbXJhZihqb2luKHRtcFJlcG9QYWNrYWdlUGF0aCwgXCJub2RlX21vZHVsZXNcIikpXG4gICAgLy8gcmVtb3ZlIC5naXQganVzdCB0byBiZSBzYWZlXG4gICAgcmltcmFmKGpvaW4odG1wUmVwb1BhY2thZ2VQYXRoLCBcIm5vZGVfbW9kdWxlc1wiKSlcblxuICAgIC8vIGFsc28gcmVtb3ZlIGlnbm9yZWQgZmlsZXMgbGlrZSBiZWZvcmVcbiAgICByZW1vdmVJZ25vcmVkRmlsZXModG1wUmVwb1BhY2thZ2VQYXRoLCBpbmNsdWRlUGF0aHMsIGV4Y2x1ZGVQYXRocylcblxuICAgIC8vIHN0YWdlIGFsbCBmaWxlc1xuICAgIGdpdChcImFkZFwiLCBcIi1mXCIsIHBhY2thZ2VEZXRhaWxzLnBhdGgpXG5cbiAgICAvLyBnZXQgZGlmZiBvZiBjaGFuZ2VzXG4gICAgY29uc3QgZGlmZlJlc3VsdCA9IGdpdChcbiAgICAgIFwiZGlmZlwiLFxuICAgICAgXCItLWNhY2hlZFwiLFxuICAgICAgXCItLW5vLWNvbG9yXCIsXG4gICAgICBcIi0taWdub3JlLXNwYWNlLWF0LWVvbFwiLFxuICAgICAgXCItLW5vLWV4dC1kaWZmXCIsXG4gICAgKVxuXG4gICAgaWYgKGRpZmZSZXN1bHQuc3Rkb3V0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBg4oGJ77iPICBOb3QgY3JlYXRpbmcgcGF0Y2ggZmlsZSBmb3IgcGFja2FnZSAnJHtwYWNrYWdlUGF0aFNwZWNpZmllcn0nYCxcbiAgICAgIClcbiAgICAgIGNvbnNvbGUud2Fybihg4oGJ77iPICBUaGVyZSBkb24ndCBhcHBlYXIgdG8gYmUgYW55IGNoYW5nZXMuYClcbiAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHBhcnNlUGF0Y2hGaWxlKGRpZmZSZXN1bHQuc3Rkb3V0LnRvU3RyaW5nKCkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKFxuICAgICAgICAoZSBhcyBFcnJvcikubWVzc2FnZS5pbmNsdWRlcyhcIlVuZXhwZWN0ZWQgZmlsZSBtb2RlIHN0cmluZzogMTIwMDAwXCIpXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgXG7im5TvuI8gJHtjaGFsay5yZWQuYm9sZChcIkVSUk9SXCIpfVxuXG4gIFlvdXIgY2hhbmdlcyBpbnZvbHZlIGNyZWF0aW5nIHN5bWxpbmtzLiBwYXRjaC1wYWNrYWdlIGRvZXMgbm90IHlldCBzdXBwb3J0XG4gIHN5bWxpbmtzLlxuICBcbiAg77iPUGxlYXNlIHVzZSAke2NoYWxrLmJvbGQoXCItLWluY2x1ZGVcIil9IGFuZC9vciAke2NoYWxrLmJvbGQoXG4gICAgICAgICAgXCItLWV4Y2x1ZGVcIixcbiAgICAgICAgKX0gdG8gbmFycm93IHRoZSBzY29wZSBvZiB5b3VyIHBhdGNoIGlmXG4gIHRoaXMgd2FzIHVuaW50ZW50aW9uYWwuXG5gKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgb3V0UGF0aCA9IFwiLi9wYXRjaC1wYWNrYWdlLWVycm9yLmpzb24uZ3pcIlxuICAgICAgICB3cml0ZUZpbGVTeW5jKFxuICAgICAgICAgIG91dFBhdGgsXG4gICAgICAgICAgZ3ppcFN5bmMoXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIGVycm9yOiB7IG1lc3NhZ2U6IGUubWVzc2FnZSwgc3RhY2s6IGUuc3RhY2sgfSxcbiAgICAgICAgICAgICAgcGF0Y2g6IGRpZmZSZXN1bHQuc3Rkb3V0LnRvU3RyaW5nKCksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICApLFxuICAgICAgICApXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFxu4puU77iPICR7Y2hhbGsucmVkLmJvbGQoXCJFUlJPUlwiKX1cbiAgICAgICAgXG4gIHBhdGNoLXBhY2thZ2Ugd2FzIHVuYWJsZSB0byByZWFkIHRoZSBwYXRjaC1maWxlIG1hZGUgYnkgZ2l0LiBUaGlzIHNob3VsZCBub3RcbiAgaGFwcGVuLlxuICBcbiAgQSBkaWFnbm9zdGljIGZpbGUgd2FzIHdyaXR0ZW4gdG9cbiAgXG4gICAgJHtvdXRQYXRofVxuICBcbiAgUGxlYXNlIGF0dGFjaCBpdCB0byBhIGdpdGh1YiBpc3N1ZVxuICBcbiAgICBodHRwczovL2dpdGh1Yi5jb20vZHMzMDAvcGF0Y2gtcGFja2FnZS9pc3N1ZXMvbmV3P3RpdGxlPU5ldytwYXRjaCtwYXJzZStmYWlsZWQmYm9keT1QbGVhc2UrYXR0YWNoK3RoZStkaWFnbm9zdGljK2ZpbGUrYnkrZHJhZ2dpbmcraXQraW50bytoZXJlK/CfmY9cbiAgXG4gIE5vdGUgdGhhdCB0aGlzIGRpYWdub3N0aWMgZmlsZSB3aWxsIGNvbnRhaW4gY29kZSBmcm9tIHRoZSBwYWNrYWdlIHlvdSB3ZXJlXG4gIGF0dGVtcHRpbmcgdG8gcGF0Y2guXG5cbmApXG4gICAgICB9XG4gICAgICBwcm9jZXNzLmV4aXQoMSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHBhY2thZ2VOYW1lcyA9IHBhY2thZ2VEZXRhaWxzLnBhY2thZ2VOYW1lc1xuICAgICAgLm1hcChuYW1lID0+IG5hbWUucmVwbGFjZSgvXFwvL2csIFwiK1wiKSlcbiAgICAgIC5qb2luKFwiKytcIilcblxuICAgIC8vIG1heWJlIGRlbGV0ZSBleGlzdGluZ1xuICAgIGdldFBhdGNoRmlsZXMocGF0Y2hEaXIpLmZvckVhY2goZmlsZW5hbWUgPT4ge1xuICAgICAgY29uc3QgZGVldHMgPSBnZXRQYWNrYWdlRGV0YWlsc0Zyb21QYXRjaEZpbGVuYW1lKGZpbGVuYW1lKVxuICAgICAgaWYgKGRlZXRzICYmIGRlZXRzLnBhdGggPT09IHBhY2thZ2VEZXRhaWxzLnBhdGgpIHtcbiAgICAgICAgdW5saW5rU3luYyhqb2luKHBhdGNoRGlyLCBmaWxlbmFtZSkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IHBhdGNoRmlsZU5hbWUgPSBgJHtwYWNrYWdlTmFtZXN9KyR7cGFja2FnZVZlcnNpb259LnBhdGNoYFxuXG4gICAgY29uc3QgcGF0Y2hQYXRoID0gam9pbihwYXRjaGVzRGlyLCBwYXRjaEZpbGVOYW1lKVxuICAgIGlmICghZXhpc3RzU3luYyhkaXJuYW1lKHBhdGNoUGF0aCkpKSB7XG4gICAgICAvLyBzY29wZWQgcGFja2FnZVxuICAgICAgbWtkaXJTeW5jKGRpcm5hbWUocGF0Y2hQYXRoKSlcbiAgICB9XG4gICAgd3JpdGVGaWxlU3luYyhwYXRjaFBhdGgsIGRpZmZSZXN1bHQuc3Rkb3V0KVxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYCR7Y2hhbGsuZ3JlZW4oXCLinJRcIil9IENyZWF0ZWQgZmlsZSAke2pvaW4ocGF0Y2hEaXIsIHBhdGNoRmlsZU5hbWUpfWAsXG4gICAgKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKVxuICAgIHRocm93IGVcbiAgfSBmaW5hbGx5IHtcbiAgICB0bXBSZXBvLnJlbW92ZUNhbGxiYWNrKClcbiAgfVxufVxuIl19