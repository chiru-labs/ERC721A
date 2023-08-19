"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = require("./path");
var chalk_1 = __importDefault(require("chalk"));
var process_1 = __importDefault(require("process"));
var find_yarn_workspace_root_1 = __importDefault(require("find-yarn-workspace-root"));
function printNoYarnLockfileError() {
    console.error("\n" + chalk_1.default.red.bold("**ERROR**") + " " + chalk_1.default.red("The --use-yarn option was specified but there is no yarn.lock file") + "\n");
}
function printNoLockfilesError() {
    console.error("\n" + chalk_1.default.red.bold("**ERROR**") + " " + chalk_1.default.red("No package-lock.json, npm-shrinkwrap.json, or yarn.lock file.\n\nYou must use either npm@>=5, yarn, or npm-shrinkwrap to manage this project's\ndependencies.") + "\n");
}
function printSelectingDefaultMessage() {
    console.info(chalk_1.default.bold("patch-package") + ": you have both yarn.lock and package-lock.json\nDefaulting to using " + chalk_1.default.bold("npm") + "\nYou can override this setting by passing --use-yarn or deleting\npackage-lock.json if you don't need it\n");
}
exports.detectPackageManager = function (appRootPath, overridePackageManager) {
    var packageLockExists = fs_extra_1.default.existsSync(path_1.join(appRootPath, "package-lock.json"));
    var shrinkWrapExists = fs_extra_1.default.existsSync(path_1.join(appRootPath, "npm-shrinkwrap.json"));
    var yarnLockExists = fs_extra_1.default.existsSync(path_1.join(appRootPath, "yarn.lock"));
    if ((packageLockExists || shrinkWrapExists) && yarnLockExists) {
        if (overridePackageManager) {
            return overridePackageManager;
        }
        else {
            printSelectingDefaultMessage();
            return shrinkWrapExists ? "npm-shrinkwrap" : "npm";
        }
    }
    else if (packageLockExists || shrinkWrapExists) {
        if (overridePackageManager === "yarn") {
            printNoYarnLockfileError();
            process_1.default.exit(1);
        }
        else {
            return shrinkWrapExists ? "npm-shrinkwrap" : "npm";
        }
    }
    else if (yarnLockExists || find_yarn_workspace_root_1.default()) {
        return "yarn";
    }
    else {
        printNoLockfilesError();
        process_1.default.exit(1);
    }
    throw Error();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0ZWN0UGFja2FnZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGV0ZWN0UGFja2FnZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzREFBeUI7QUFDekIsK0JBQTZCO0FBQzdCLGdEQUF5QjtBQUN6QixvREFBNkI7QUFDN0Isc0ZBQXdEO0FBSXhELFNBQVMsd0JBQXdCO0lBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FDZCxlQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBSSxlQUFLLENBQUMsR0FBRyxDQUN0QyxvRUFBb0UsQ0FDckUsT0FDRixDQUFDLENBQUE7QUFDRixDQUFDO0FBRUQsU0FBUyxxQkFBcUI7SUFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUNkLGVBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFJLGVBQUssQ0FBQyxHQUFHLENBQ3RDLCtKQUdVLENBQ1gsT0FDRixDQUFDLENBQUE7QUFDRixDQUFDO0FBRUQsU0FBUyw0QkFBNEI7SUFDbkMsT0FBTyxDQUFDLElBQUksQ0FDUCxlQUFLLENBQUMsSUFBSSxDQUNYLGVBQWUsQ0FDaEIsNkVBQ2lCLGVBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdIQUd0QyxDQUNFLENBQUE7QUFDSCxDQUFDO0FBRVksUUFBQSxvQkFBb0IsR0FBRyxVQUNsQyxXQUFtQixFQUNuQixzQkFBNkM7SUFFN0MsSUFBTSxpQkFBaUIsR0FBRyxrQkFBRSxDQUFDLFVBQVUsQ0FDckMsV0FBSSxDQUFDLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQyxDQUN2QyxDQUFBO0lBQ0QsSUFBTSxnQkFBZ0IsR0FBRyxrQkFBRSxDQUFDLFVBQVUsQ0FDcEMsV0FBSSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsQ0FBQyxDQUN6QyxDQUFBO0lBQ0QsSUFBTSxjQUFjLEdBQUcsa0JBQUUsQ0FBQyxVQUFVLENBQUMsV0FBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFBO0lBQ3BFLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLGNBQWMsRUFBRTtRQUM3RCxJQUFJLHNCQUFzQixFQUFFO1lBQzFCLE9BQU8sc0JBQXNCLENBQUE7U0FDOUI7YUFBTTtZQUNMLDRCQUE0QixFQUFFLENBQUE7WUFDOUIsT0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtTQUNuRDtLQUNGO1NBQU0sSUFBSSxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFBRTtRQUNoRCxJQUFJLHNCQUFzQixLQUFLLE1BQU0sRUFBRTtZQUNyQyx3QkFBd0IsRUFBRSxDQUFBO1lBQzFCLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2hCO2FBQU07WUFDTCxPQUFPLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO1NBQ25EO0tBQ0Y7U0FBTSxJQUFJLGNBQWMsSUFBSSxrQ0FBaUIsRUFBRSxFQUFFO1FBQ2hELE9BQU8sTUFBTSxDQUFBO0tBQ2Q7U0FBTTtRQUNMLHFCQUFxQixFQUFFLENBQUE7UUFDdkIsaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEI7SUFDRCxNQUFNLEtBQUssRUFBRSxDQUFBO0FBQ2YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiXG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIi4vcGF0aFwiXG5pbXBvcnQgY2hhbGsgZnJvbSBcImNoYWxrXCJcbmltcG9ydCBwcm9jZXNzIGZyb20gXCJwcm9jZXNzXCJcbmltcG9ydCBmaW5kV29ya3NwYWNlUm9vdCBmcm9tIFwiZmluZC15YXJuLXdvcmtzcGFjZS1yb290XCJcblxuZXhwb3J0IHR5cGUgUGFja2FnZU1hbmFnZXIgPSBcInlhcm5cIiB8IFwibnBtXCIgfCBcIm5wbS1zaHJpbmt3cmFwXCJcblxuZnVuY3Rpb24gcHJpbnROb1lhcm5Mb2NrZmlsZUVycm9yKCkge1xuICBjb25zb2xlLmVycm9yKGBcbiR7Y2hhbGsucmVkLmJvbGQoXCIqKkVSUk9SKipcIil9ICR7Y2hhbGsucmVkKFxuICAgIGBUaGUgLS11c2UteWFybiBvcHRpb24gd2FzIHNwZWNpZmllZCBidXQgdGhlcmUgaXMgbm8geWFybi5sb2NrIGZpbGVgLFxuICApfVxuYClcbn1cblxuZnVuY3Rpb24gcHJpbnROb0xvY2tmaWxlc0Vycm9yKCkge1xuICBjb25zb2xlLmVycm9yKGBcbiR7Y2hhbGsucmVkLmJvbGQoXCIqKkVSUk9SKipcIil9ICR7Y2hhbGsucmVkKFxuICAgIGBObyBwYWNrYWdlLWxvY2suanNvbiwgbnBtLXNocmlua3dyYXAuanNvbiwgb3IgeWFybi5sb2NrIGZpbGUuXG5cbllvdSBtdXN0IHVzZSBlaXRoZXIgbnBtQD49NSwgeWFybiwgb3IgbnBtLXNocmlua3dyYXAgdG8gbWFuYWdlIHRoaXMgcHJvamVjdCdzXG5kZXBlbmRlbmNpZXMuYCxcbiAgKX1cbmApXG59XG5cbmZ1bmN0aW9uIHByaW50U2VsZWN0aW5nRGVmYXVsdE1lc3NhZ2UoKSB7XG4gIGNvbnNvbGUuaW5mbyhcbiAgICBgJHtjaGFsay5ib2xkKFxuICAgICAgXCJwYXRjaC1wYWNrYWdlXCIsXG4gICAgKX06IHlvdSBoYXZlIGJvdGggeWFybi5sb2NrIGFuZCBwYWNrYWdlLWxvY2suanNvblxuRGVmYXVsdGluZyB0byB1c2luZyAke2NoYWxrLmJvbGQoXCJucG1cIil9XG5Zb3UgY2FuIG92ZXJyaWRlIHRoaXMgc2V0dGluZyBieSBwYXNzaW5nIC0tdXNlLXlhcm4gb3IgZGVsZXRpbmdcbnBhY2thZ2UtbG9jay5qc29uIGlmIHlvdSBkb24ndCBuZWVkIGl0XG5gLFxuICApXG59XG5cbmV4cG9ydCBjb25zdCBkZXRlY3RQYWNrYWdlTWFuYWdlciA9IChcbiAgYXBwUm9vdFBhdGg6IHN0cmluZyxcbiAgb3ZlcnJpZGVQYWNrYWdlTWFuYWdlcjogUGFja2FnZU1hbmFnZXIgfCBudWxsLFxuKTogUGFja2FnZU1hbmFnZXIgPT4ge1xuICBjb25zdCBwYWNrYWdlTG9ja0V4aXN0cyA9IGZzLmV4aXN0c1N5bmMoXG4gICAgam9pbihhcHBSb290UGF0aCwgXCJwYWNrYWdlLWxvY2suanNvblwiKSxcbiAgKVxuICBjb25zdCBzaHJpbmtXcmFwRXhpc3RzID0gZnMuZXhpc3RzU3luYyhcbiAgICBqb2luKGFwcFJvb3RQYXRoLCBcIm5wbS1zaHJpbmt3cmFwLmpzb25cIiksXG4gIClcbiAgY29uc3QgeWFybkxvY2tFeGlzdHMgPSBmcy5leGlzdHNTeW5jKGpvaW4oYXBwUm9vdFBhdGgsIFwieWFybi5sb2NrXCIpKVxuICBpZiAoKHBhY2thZ2VMb2NrRXhpc3RzIHx8IHNocmlua1dyYXBFeGlzdHMpICYmIHlhcm5Mb2NrRXhpc3RzKSB7XG4gICAgaWYgKG92ZXJyaWRlUGFja2FnZU1hbmFnZXIpIHtcbiAgICAgIHJldHVybiBvdmVycmlkZVBhY2thZ2VNYW5hZ2VyXG4gICAgfSBlbHNlIHtcbiAgICAgIHByaW50U2VsZWN0aW5nRGVmYXVsdE1lc3NhZ2UoKVxuICAgICAgcmV0dXJuIHNocmlua1dyYXBFeGlzdHMgPyBcIm5wbS1zaHJpbmt3cmFwXCIgOiBcIm5wbVwiXG4gICAgfVxuICB9IGVsc2UgaWYgKHBhY2thZ2VMb2NrRXhpc3RzIHx8IHNocmlua1dyYXBFeGlzdHMpIHtcbiAgICBpZiAob3ZlcnJpZGVQYWNrYWdlTWFuYWdlciA9PT0gXCJ5YXJuXCIpIHtcbiAgICAgIHByaW50Tm9ZYXJuTG9ja2ZpbGVFcnJvcigpXG4gICAgICBwcm9jZXNzLmV4aXQoMSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNocmlua1dyYXBFeGlzdHMgPyBcIm5wbS1zaHJpbmt3cmFwXCIgOiBcIm5wbVwiXG4gICAgfVxuICB9IGVsc2UgaWYgKHlhcm5Mb2NrRXhpc3RzIHx8IGZpbmRXb3Jrc3BhY2VSb290KCkpIHtcbiAgICByZXR1cm4gXCJ5YXJuXCJcbiAgfSBlbHNlIHtcbiAgICBwcmludE5vTG9ja2ZpbGVzRXJyb3IoKVxuICAgIHByb2Nlc3MuZXhpdCgxKVxuICB9XG4gIHRocm93IEVycm9yKClcbn1cbiJdfQ==