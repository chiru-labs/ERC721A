"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("./path");
var PackageDetails_1 = require("./PackageDetails");
var detectPackageManager_1 = require("./detectPackageManager");
var fs_extra_1 = require("fs-extra");
var lockfile_1 = require("@yarnpkg/lockfile");
var find_yarn_workspace_root_1 = __importDefault(require("find-yarn-workspace-root"));
function getPackageResolution(_a) {
    var packageDetails = _a.packageDetails, packageManager = _a.packageManager, appPath = _a.appPath;
    if (packageManager === "yarn") {
        var lockFilePath = "yarn.lock";
        if (!fs_extra_1.existsSync(lockFilePath)) {
            var workspaceRoot = find_yarn_workspace_root_1.default();
            if (!workspaceRoot) {
                throw new Error("Can't find yarn.lock file");
            }
            lockFilePath = path_1.join(workspaceRoot, "yarn.lock");
        }
        if (!fs_extra_1.existsSync(lockFilePath)) {
            throw new Error("Can't find yarn.lock file");
        }
        var appLockFile = lockfile_1.parse(fs_extra_1.readFileSync(lockFilePath).toString());
        if (appLockFile.type !== "success") {
            throw new Error("Can't parse lock file");
        }
        var installedVersion_1 = require(path_1.join(path_1.resolve(appPath, packageDetails.path), "package.json")).version;
        var entries = Object.entries(appLockFile.object).filter(function (_a) {
            var k = _a[0], v = _a[1];
            return k.startsWith(packageDetails.name + "@") &&
                v.version === installedVersion_1;
        });
        var resolutions = entries.map(function (_a) {
            var _ = _a[0], v = _a[1];
            return v.resolved;
        });
        if (resolutions.length === 0) {
            throw new Error("Can't find lockfile entry for " + packageDetails.pathSpecifier);
        }
        if (new Set(resolutions).size !== 1) {
            console.warn("Ambigious lockfile entries for " + packageDetails.pathSpecifier + ". Using version " + installedVersion_1);
            return installedVersion_1;
        }
        if (resolutions[0]) {
            return resolutions[0];
        }
        var resolution = entries[0][0].slice(packageDetails.name.length + 1);
        // resolve relative file path
        if (resolution.startsWith("file:.")) {
            return "file:" + path_1.resolve(appPath, resolution.slice("file:".length));
        }
        return resolution;
    }
    else {
        var lockfile = require(path_1.join(appPath, packageManager === "npm-shrinkwrap"
            ? "npm-shrinkwrap.json"
            : "package-lock.json"));
        var lockFileStack = [lockfile];
        for (var _i = 0, _b = packageDetails.packageNames.slice(0, -1); _i < _b.length; _i++) {
            var name = _b[_i];
            var child = lockFileStack[0].dependencies;
            if (child && name in child) {
                lockFileStack.push(child[name]);
            }
        }
        lockFileStack.reverse();
        var relevantStackEntry = lockFileStack.find(function (entry) { return entry.dependencies && packageDetails.name in entry.dependencies; });
        var pkg = relevantStackEntry.dependencies[packageDetails.name];
        return pkg.resolved || pkg.from || pkg.version;
    }
}
exports.getPackageResolution = getPackageResolution;
if (require.main === module) {
    var packageDetails = PackageDetails_1.getPatchDetailsFromCliString(process.argv[2]);
    if (!packageDetails) {
        console.error("Can't find package " + process.argv[2]);
        process.exit(1);
        throw new Error();
    }
    console.log(getPackageResolution({
        appPath: process.cwd(),
        packageDetails: packageDetails,
        packageManager: detectPackageManager_1.detectPackageManager(process.cwd(), null),
    }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGFja2FnZVJlc29sdXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZ2V0UGFja2FnZVJlc29sdXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQkFBc0M7QUFDdEMsbURBQStFO0FBQy9FLCtEQUE2RTtBQUM3RSxxQ0FBbUQ7QUFDbkQsOENBQThEO0FBQzlELHNGQUF3RDtBQUV4RCxTQUFnQixvQkFBb0IsQ0FBQyxFQVFwQztRQVBDLGtDQUFjLEVBQ2Qsa0NBQWMsRUFDZCxvQkFBTztJQU1QLElBQUksY0FBYyxLQUFLLE1BQU0sRUFBRTtRQUM3QixJQUFJLFlBQVksR0FBRyxXQUFXLENBQUE7UUFDOUIsSUFBSSxDQUFDLHFCQUFVLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDN0IsSUFBTSxhQUFhLEdBQUcsa0NBQWlCLEVBQUUsQ0FBQTtZQUN6QyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUE7YUFDN0M7WUFDRCxZQUFZLEdBQUcsV0FBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQTtTQUNoRDtRQUNELElBQUksQ0FBQyxxQkFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQTtTQUM3QztRQUNELElBQU0sV0FBVyxHQUFHLGdCQUFpQixDQUFDLHVCQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtRQUM1RSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtTQUN6QztRQUVELElBQU0sa0JBQWdCLEdBQUcsT0FBTyxDQUFDLFdBQUksQ0FDbkMsY0FBTyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQ3JDLGNBQWMs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SCxDQUFDO0FBdkZELG9EQXVGQztBQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7SUFDM0IsSUFBTSxjQUFjLEdBQUcsNkNBQTRCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3BFLElBQUksQ0FBQyxjQUFjLEVBQUU7UUFDbkIsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBc0IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUcsQ0FBQyxDQUFBO1FBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDZixNQUFNLElBQUksS0FBSyxFQUFFLENBQUE7S0FDbEI7SUFDRCxPQUFPLENBQUMsR0FBRyxDQUNULG9CQUFvQixDQUFDO1FBQ25CLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ3RCLGNBQWMsZ0JBQUE7UUFDZCxjQUFjLEVBQUUsMkNBQW9CLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQztLQUMxRCxDQUFDLENBQ0gsQ0FBQTtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSB9IGZyb20gXCIuL3BhdGhcIlxuaW1wb3J0IHsgUGFja2FnZURldGFpbHMsIGdldFBhdGNoRGV0YWlsc0Zyb21DbGlTdHJpbmcgfSBmcm9tIFwiLi9QYWNrYWdlRGV0YWlsc1wiXG5pbXBvcnQgeyBQYWNrYWdlTWFuYWdlciwgZGV0ZWN0UGFja2FnZU1hbmFnZXIgfSBmcm9tIFwiLi9kZXRlY3RQYWNrYWdlTWFuYWdlclwiXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMsIGV4aXN0c1N5bmMgfSBmcm9tIFwiZnMtZXh0cmFcIlxuaW1wb3J0IHsgcGFyc2UgYXMgcGFyc2VZYXJuTG9ja0ZpbGUgfSBmcm9tIFwiQHlhcm5wa2cvbG9ja2ZpbGVcIlxuaW1wb3J0IGZpbmRXb3Jrc3BhY2VSb290IGZyb20gXCJmaW5kLXlhcm4td29ya3NwYWNlLXJvb3RcIlxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFja2FnZVJlc29sdXRpb24oe1xuICBwYWNrYWdlRGV0YWlscyxcbiAgcGFja2FnZU1hbmFnZXIsXG4gIGFwcFBhdGgsXG59OiB7XG4gIHBhY2thZ2VEZXRhaWxzOiBQYWNrYWdlRGV0YWlsc1xuICBwYWNrYWdlTWFuYWdlcjogUGFja2FnZU1hbmFnZXJcbiAgYXBwUGF0aDogc3RyaW5nXG59KSB7XG4gIGlmIChwYWNrYWdlTWFuYWdlciA9PT0gXCJ5YXJuXCIpIHtcbiAgICBsZXQgbG9ja0ZpbGVQYXRoID0gXCJ5YXJuLmxvY2tcIlxuICAgIGlmICghZXhpc3RzU3luYyhsb2NrRmlsZVBhdGgpKSB7XG4gICAgICBjb25zdCB3b3Jrc3BhY2VSb290ID0gZmluZFdvcmtzcGFjZVJvb3QoKVxuICAgICAgaWYgKCF3b3Jrc3BhY2VSb290KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGZpbmQgeWFybi5sb2NrIGZpbGVcIilcbiAgICAgIH1cbiAgICAgIGxvY2tGaWxlUGF0aCA9IGpvaW4od29ya3NwYWNlUm9vdCwgXCJ5YXJuLmxvY2tcIilcbiAgICB9XG4gICAgaWYgKCFleGlzdHNTeW5jKGxvY2tGaWxlUGF0aCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGZpbmQgeWFybi5sb2NrIGZpbGVcIilcbiAgICB9XG4gICAgY29uc3QgYXBwTG9ja0ZpbGUgPSBwYXJzZVlhcm5Mb2NrRmlsZShyZWFkRmlsZVN5bmMobG9ja0ZpbGVQYXRoKS50b1N0cmluZygpKVxuICAgIGlmIChhcHBMb2NrRmlsZS50eXBlICE9PSBcInN1Y2Nlc3NcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgcGFyc2UgbG9jayBmaWxlXCIpXG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFsbGVkVmVyc2lvbiA9IHJlcXVpcmUoam9pbihcbiAgICAgIHJlc29sdmUoYXBwUGF0aCwgcGFja2FnZURldGFpbHMucGF0aCksXG4gICAgICBcInBhY2thZ2UuanNvblwiLFxuICAgICkpLnZlcnNpb24gYXMgc3RyaW5nXG5cbiAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoYXBwTG9ja0ZpbGUub2JqZWN0KS5maWx0ZXIoXG4gICAgICAoW2ssIHZdKSA9PlxuICAgICAgICBrLnN0YXJ0c1dpdGgocGFja2FnZURldGFpbHMubmFtZSArIFwiQFwiKSAmJlxuICAgICAgICB2LnZlcnNpb24gPT09IGluc3RhbGxlZFZlcnNpb24sXG4gICAgKVxuXG4gICAgY29uc3QgcmVzb2x1dGlvbnMgPSBlbnRyaWVzLm1hcCgoW18sIHZdKSA9PiB7XG4gICAgICByZXR1cm4gdi5yZXNvbHZlZFxuICAgIH0pXG5cbiAgICBpZiAocmVzb2x1dGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBDYW4ndCBmaW5kIGxvY2tmaWxlIGVudHJ5IGZvciAke3BhY2thZ2VEZXRhaWxzLnBhdGhTcGVjaWZpZXJ9YCxcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAobmV3IFNldChyZXNvbHV0aW9ucykuc2l6ZSAhPT0gMSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBgQW1iaWdpb3VzIGxvY2tmaWxlIGVudHJpZXMgZm9yICR7cGFja2FnZURldGFpbHMucGF0aFNwZWNpZmllcn0uIFVzaW5nIHZlcnNpb24gJHtpbnN0YWxsZWRWZXJzaW9ufWAsXG4gICAgICApXG4gICAgICByZXR1cm4gaW5zdGFsbGVkVmVyc2lvblxuICAgIH1cblxuICAgIGlmIChyZXNvbHV0aW9uc1swXSkge1xuICAgICAgcmV0dXJuIHJlc29sdXRpb25zWzBdXG4gICAgfVxuXG4gICAgY29uc3QgcmVzb2x1dGlvbiA9IGVudHJpZXNbMF1bMF0uc2xpY2UocGFja2FnZURldGFpbHMubmFtZS5sZW5ndGggKyAxKVxuXG4gICAgLy8gcmVzb2x2ZSByZWxhdGl2ZSBmaWxlIHBhdGhcbiAgICBpZiAocmVzb2x1dGlvbi5zdGFydHNXaXRoKFwiZmlsZTouXCIpKSB7XG4gICAgICByZXR1cm4gYGZpbGU6JHtyZXNvbHZlKGFwcFBhdGgsIHJlc29sdXRpb24uc2xpY2UoXCJmaWxlOlwiLmxlbmd0aCkpfWBcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb2x1dGlvblxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGxvY2tmaWxlID0gcmVxdWlyZShqb2luKFxuICAgICAgYXBwUGF0aCxcbiAgICAgIHBhY2thZ2VNYW5hZ2VyID09PSBcIm5wbS1zaHJpbmt3cmFwXCJcbiAgICAgICAgPyBcIm5wbS1zaHJpbmt3cmFwLmpzb25cIlxuICAgICAgICA6IFwicGFja2FnZS1sb2NrLmpzb25cIixcbiAgICApKVxuICAgIGNvbnN0IGxvY2tGaWxlU3RhY2sgPSBbbG9ja2ZpbGVdXG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHBhY2thZ2VEZXRhaWxzLnBhY2thZ2VOYW1lcy5zbGljZSgwLCAtMSkpIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gbG9ja0ZpbGVTdGFja1swXS5kZXBlbmRlbmNpZXNcbiAgICAgIGlmIChjaGlsZCAmJiBuYW1lIGluIGNoaWxkKSB7XG4gICAgICAgIGxvY2tGaWxlU3RhY2sucHVzaChjaGlsZFtuYW1lXSlcbiAgICAgIH1cbiAgICB9XG4gICAgbG9ja0ZpbGVTdGFjay5yZXZlcnNlKClcbiAgICBjb25zdCByZWxldmFudFN0YWNrRW50cnkgPSBsb2NrRmlsZVN0YWNrLmZpbmQoXG4gICAgICBlbnRyeSA9PiBlbnRyeS5kZXBlbmRlbmNpZXMgJiYgcGFja2FnZURldGFpbHMubmFtZSBpbiBlbnRyeS5kZXBlbmRlbmNpZXMsXG4gICAgKVxuICAgIGNvbnN0IHBrZyA9IHJlbGV2YW50U3RhY2tFbnRyeS5kZXBlbmRlbmNpZXNbcGFja2FnZURldGFpbHMubmFtZV1cbiAgICByZXR1cm4gcGtnLnJlc29sdmVkIHx8IHBrZy5mcm9tIHx8IHBrZy52ZXJzaW9uXG4gIH1cbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGNvbnN0IHBhY2thZ2VEZXRhaWxzID0gZ2V0UGF0Y2hEZXRhaWxzRnJvbUNsaVN0cmluZyhwcm9jZXNzLmFyZ3ZbMl0pXG4gIGlmICghcGFja2FnZURldGFpbHMpIHtcbiAgICBjb25zb2xlLmVycm9yKGBDYW4ndCBmaW5kIHBhY2thZ2UgJHtwcm9jZXNzLmFyZ3ZbMl19YClcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoKVxuICB9XG4gIGNvbnNvbGUubG9nKFxuICAgIGdldFBhY2thZ2VSZXNvbHV0aW9uKHtcbiAgICAgIGFwcFBhdGg6IHByb2Nlc3MuY3dkKCksXG4gICAgICBwYWNrYWdlRGV0YWlscyxcbiAgICAgIHBhY2thZ2VNYW5hZ2VyOiBkZXRlY3RQYWNrYWdlTWFuYWdlcihwcm9jZXNzLmN3ZCgpLCBudWxsKSxcbiAgICB9KSxcbiAgKVxufVxuIl19