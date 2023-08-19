"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var process_1 = __importDefault(require("process"));
var minimist_1 = __importDefault(require("minimist"));
var applyPatches_1 = require("./applyPatches");
var getAppRootPath_1 = require("./getAppRootPath");
var makePatch_1 = require("./makePatch");
var makeRegExp_1 = require("./makeRegExp");
var detectPackageManager_1 = require("./detectPackageManager");
var path_1 = require("./path");
var path_2 = require("path");
var slash = require("slash");
var appPath = getAppRootPath_1.getAppRootPath();
var argv = minimist_1.default(process_1.default.argv.slice(2), {
    boolean: [
        "use-yarn",
        "case-sensitive-path-filtering",
        "reverse",
        "help",
        "version",
    ],
    string: ["patch-dir"],
});
var packageNames = argv._;
console.log(chalk_1.default.bold("patch-package"), 
// tslint:disable-next-line:no-var-requires
require(path_1.join(__dirname, "../package.json")).version);
if (argv.version || argv.v) {
    // noop
}
else if (argv.help || argv.h) {
    printHelp();
}
else {
    var patchDir_1 = slash(path_2.normalize((argv["patch-dir"] || "patches") + path_2.sep));
    if (patchDir_1.startsWith("/")) {
        throw new Error("--patch-dir must be a relative path");
    }
    if (packageNames.length) {
        var includePaths_1 = makeRegExp_1.makeRegExp(argv.include, "include", /.*/, argv["case-sensitive-path-filtering"]);
        var excludePaths_1 = makeRegExp_1.makeRegExp(argv.exclude, "exclude", /package\.json$/, argv["case-sensitive-path-filtering"]);
        var packageManager_1 = detectPackageManager_1.detectPackageManager(appPath, argv["use-yarn"] ? "yarn" : null);
        packageNames.forEach(function (packagePathSpecifier) {
            makePatch_1.makePatch({
                packagePathSpecifier: packagePathSpecifier,
                appPath: appPath,
                packageManager: packageManager_1,
                includePaths: includePaths_1,
                excludePaths: excludePaths_1,
                patchDir: patchDir_1,
            });
        });
    }
    else {
        console.log("Applying patches...");
        var reverse = !!argv["reverse"];
        applyPatches_1.applyPatchesForApp({ appPath: appPath, reverse: reverse, patchDir: patchDir_1 });
    }
}
function printHelp() {
    console.log("\nUsage:\n\n  1. Patching packages\n  ====================\n\n    " + chalk_1.default.bold("patch-package") + "\n\n  Without arguments, the " + chalk_1.default.bold("patch-package") + " command will attempt to find and apply\n  patch files to your project. It looks for files named like\n\n     ./patches/<package-name>+<version>.patch\n\n  2. Creating patch files\n  =======================\n\n    " + chalk_1.default.bold("patch-package") + " <package-name>" + chalk_1.default.italic("[ <package-name>]") + "\n\n  When given package names as arguments, patch-package will create patch files\n  based on any changes you've made to the versions installed by yarn/npm.\n\n  Options:\n\n     " + chalk_1.default.bold("--use-yarn") + "\n\n         By default, patch-package checks whether you use npm or yarn based on\n         which lockfile you have. If you have both, it uses npm by default.\n         Set this option to override that default and always use yarn.\n\n     " + chalk_1.default.bold("--exclude <regexp>") + "\n\n         Ignore paths matching the regexp when creating patch files.\n         Paths are relative to the root dir of the package to be patched.\n\n         Default: 'package\\.json$'\n\n     " + chalk_1.default.bold("--include <regexp>") + "\n\n         Only consider paths matching the regexp when creating patch files.\n         Paths are relative to the root dir of the package to be patched.\n\n         Default '.*'\n\n     " + chalk_1.default.bold("--case-sensitive-path-filtering") + "\n\n         Make regexps used in --include or --exclude filters case-sensitive.\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnREFBeUI7QUFDekIsb0RBQTZCO0FBQzdCLHNEQUErQjtBQUUvQiwrQ0FBbUQ7QUFDbkQsbURBQWlEO0FBQ2pELHlDQUF1QztBQUN2QywyQ0FBeUM7QUFDekMsK0RBQTZEO0FBQzdELCtCQUE2QjtBQUM3Qiw2QkFBcUM7QUFDckMsNkJBQStCO0FBRS9CLElBQU0sT0FBTyxHQUFHLCtCQUFjLEVBQUUsQ0FBQTtBQUNoQyxJQUFNLElBQUksR0FBRyxrQkFBUSxDQUFDLGlCQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUMzQyxPQUFPLEVBQUU7UUFDUCxVQUFVO1FBQ1YsK0JBQStCO1FBQy9CLFNBQVM7UUFDVCxNQUFNO1FBQ04sU0FBUztLQUNWO0lBQ0QsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDO0NBQ3RCLENBQUMsQ0FBQTtBQUNGLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUE7QUFFM0IsT0FBTyxDQUFDLEdBQUcsQ0FDVCxlQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztBQUMzQiwyQ0FBMkM7QUFDM0MsT0FBTyxDQUFDLFdBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FDcEQsQ0FBQTtBQUVELElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0lBQzFCLE9BQU87Q0FDUjtLQUFNLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0lBQzlCLFNBQVMsRUFBRSxDQUFBO0NBQ1o7S0FBTTtJQUNMLElBQU0sVUFBUSxHQUFHLEtBQUssQ0FBQyxnQkFBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLFVBQUcsQ0FBQyxDQUFDLENBQUE7SUFDekUsSUFBSSxVQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQTtLQUN2RDtJQUNELElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtRQUN2QixJQUFNLGNBQVksR0FBRyx1QkFBVSxDQUM3QixJQUFJLENBQUMsT0FBTyxFQUNaLFNBQVMsRUFDVCxJQUFJLEVBQ0osSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQ3RDLENBQUE7UUFDRCxJQUFNLGNBQVksR0FBRyx1QkFBVSxDQUM3QixJQUFJLENBQUMsT0FBTyxFQUNaLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQ3RDLENBQUE7UUFDRCxJQUFNLGdCQUFjLEdBQUcsMkNBQW9CLENBQ3pDLE9BQU8sRUFDUCxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNqQyxDQUFBO1FBQ0QsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFDLG9CQUE0QjtZQUNoRCxxQkFBUyxDQUFDO2dCQUNSLG9CQUFvQixzQkFBQTtnQkFDcEIsT0FBTyxTQUFBO2dCQUNQLGNBQWMsa0JBQUE7Z0JBQ2QsWUFBWSxnQkFBQTtnQkFDWixZQUFZLGdCQUFBO2dCQUNaLFFBQVEsWUFBQTthQUNULENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO0tBQ0g7U0FBTTtRQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQTtRQUNsQyxJQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2pDLGlDQUFrQixDQUFDLEVBQUUsT0FBTyxTQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUUsUUFBUSxZQUFBLEVBQUUsQ0FBQyxDQUFBO0tBQ25EO0NBQ0Y7QUFFRCxTQUFTLFNBQVM7SUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1RUFNUixlQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQ0FFTixlQUFLLENBQUMsSUFBSSxDQUNqQyxlQUFlLENBQ2hCLDhOQVFHLGVBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHVCQUFrQixlQUFLLENBQUMsTUFBTSxDQUMzRCxtQkFBbUIsQ0FDcEIsNExBT0ksZUFBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsd1BBTXhCLGVBQUssQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsMk1BT2hDLGVBQUssQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsb01BT2hDLGVBQUssQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsdUZBR25ELENBQUMsQ0FBQTtBQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hhbGsgZnJvbSBcImNoYWxrXCJcbmltcG9ydCBwcm9jZXNzIGZyb20gXCJwcm9jZXNzXCJcbmltcG9ydCBtaW5pbWlzdCBmcm9tIFwibWluaW1pc3RcIlxuXG5pbXBvcnQgeyBhcHBseVBhdGNoZXNGb3JBcHAgfSBmcm9tIFwiLi9hcHBseVBhdGNoZXNcIlxuaW1wb3J0IHsgZ2V0QXBwUm9vdFBhdGggfSBmcm9tIFwiLi9nZXRBcHBSb290UGF0aFwiXG5pbXBvcnQgeyBtYWtlUGF0Y2ggfSBmcm9tIFwiLi9tYWtlUGF0Y2hcIlxuaW1wb3J0IHsgbWFrZVJlZ0V4cCB9IGZyb20gXCIuL21ha2VSZWdFeHBcIlxuaW1wb3J0IHsgZGV0ZWN0UGFja2FnZU1hbmFnZXIgfSBmcm9tIFwiLi9kZXRlY3RQYWNrYWdlTWFuYWdlclwiXG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIi4vcGF0aFwiXG5pbXBvcnQgeyBub3JtYWxpemUsIHNlcCB9IGZyb20gXCJwYXRoXCJcbmltcG9ydCBzbGFzaCA9IHJlcXVpcmUoXCJzbGFzaFwiKVxuXG5jb25zdCBhcHBQYXRoID0gZ2V0QXBwUm9vdFBhdGgoKVxuY29uc3QgYXJndiA9IG1pbmltaXN0KHByb2Nlc3MuYXJndi5zbGljZSgyKSwge1xuICBib29sZWFuOiBbXG4gICAgXCJ1c2UteWFyblwiLFxuICAgIFwiY2FzZS1zZW5zaXRpdmUtcGF0aC1maWx0ZXJpbmdcIixcbiAgICBcInJldmVyc2VcIixcbiAgICBcImhlbHBcIixcbiAgICBcInZlcnNpb25cIixcbiAgXSxcbiAgc3RyaW5nOiBbXCJwYXRjaC1kaXJcIl0sXG59KVxuY29uc3QgcGFja2FnZU5hbWVzID0gYXJndi5fXG5cbmNvbnNvbGUubG9nKFxuICBjaGFsay5ib2xkKFwicGF0Y2gtcGFja2FnZVwiKSxcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXZhci1yZXF1aXJlc1xuICByZXF1aXJlKGpvaW4oX19kaXJuYW1lLCBcIi4uL3BhY2thZ2UuanNvblwiKSkudmVyc2lvbixcbilcblxuaWYgKGFyZ3YudmVyc2lvbiB8fCBhcmd2LnYpIHtcbiAgLy8gbm9vcFxufSBlbHNlIGlmIChhcmd2LmhlbHAgfHwgYXJndi5oKSB7XG4gIHByaW50SGVscCgpXG59IGVsc2Uge1xuICBjb25zdCBwYXRjaERpciA9IHNsYXNoKG5vcm1hbGl6ZSgoYXJndltcInBhdGNoLWRpclwiXSB8fCBcInBhdGNoZXNcIikgKyBzZXApKVxuICBpZiAocGF0Y2hEaXIuc3RhcnRzV2l0aChcIi9cIikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCItLXBhdGNoLWRpciBtdXN0IGJlIGEgcmVsYXRpdmUgcGF0aFwiKVxuICB9XG4gIGlmIChwYWNrYWdlTmFtZXMubGVuZ3RoKSB7XG4gICAgY29uc3QgaW5jbHVkZVBhdGhzID0gbWFrZVJlZ0V4cChcbiAgICAgIGFyZ3YuaW5jbHVkZSxcbiAgICAgIFwiaW5jbHVkZVwiLFxuICAgICAgLy4qLyxcbiAgICAgIGFyZ3ZbXCJjYXNlLXNlbnNpdGl2ZS1wYXRoLWZpbHRlcmluZ1wiXSxcbiAgICApXG4gICAgY29uc3QgZXhjbHVkZVBhdGhzID0gbWFrZVJlZ0V4cChcbiAgICAgIGFyZ3YuZXhjbHVkZSxcbiAgICAgIFwiZXhjbHVkZVwiLFxuICAgICAgL3BhY2thZ2VcXC5qc29uJC8sXG4gICAgICBhcmd2W1wiY2FzZS1zZW5zaXRpdmUtcGF0aC1maWx0ZXJpbmdcIl0sXG4gICAgKVxuICAgIGNvbnN0IHBhY2thZ2VNYW5hZ2VyID0gZGV0ZWN0UGFja2FnZU1hbmFnZXIoXG4gICAgICBhcHBQYXRoLFxuICAgICAgYXJndltcInVzZS15YXJuXCJdID8gXCJ5YXJuXCIgOiBudWxsLFxuICAgIClcbiAgICBwYWNrYWdlTmFtZXMuZm9yRWFjaCgocGFja2FnZVBhdGhTcGVjaWZpZXI6IHN0cmluZykgPT4ge1xuICAgICAgbWFrZVBhdGNoKHtcbiAgICAgICAgcGFja2FnZVBhdGhTcGVjaWZpZXIsXG4gICAgICAgIGFwcFBhdGgsXG4gICAgICAgIHBhY2thZ2VNYW5hZ2VyLFxuICAgICAgICBpbmNsdWRlUGF0aHMsXG4gICAgICAgIGV4Y2x1ZGVQYXRocyxcbiAgICAgICAgcGF0Y2hEaXIsXG4gICAgICB9KVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJBcHBseWluZyBwYXRjaGVzLi4uXCIpXG4gICAgY29uc3QgcmV2ZXJzZSA9ICEhYXJndltcInJldmVyc2VcIl1cbiAgICBhcHBseVBhdGNoZXNGb3JBcHAoeyBhcHBQYXRoLCByZXZlcnNlLCBwYXRjaERpciB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIHByaW50SGVscCgpIHtcbiAgY29uc29sZS5sb2coYFxuVXNhZ2U6XG5cbiAgMS4gUGF0Y2hpbmcgcGFja2FnZXNcbiAgPT09PT09PT09PT09PT09PT09PT1cblxuICAgICR7Y2hhbGsuYm9sZChcInBhdGNoLXBhY2thZ2VcIil9XG5cbiAgV2l0aG91dCBhcmd1bWVudHMsIHRoZSAke2NoYWxrLmJvbGQoXG4gICAgXCJwYXRjaC1wYWNrYWdlXCIsXG4gICl9IGNvbW1hbmQgd2lsbCBhdHRlbXB0IHRvIGZpbmQgYW5kIGFwcGx5XG4gIHBhdGNoIGZpbGVzIHRvIHlvdXIgcHJvamVjdC4gSXQgbG9va3MgZm9yIGZpbGVzIG5hbWVkIGxpa2VcblxuICAgICAuL3BhdGNoZXMvPHBhY2thZ2UtbmFtZT4rPHZlcnNpb24+LnBhdGNoXG5cbiAgMi4gQ3JlYXRpbmcgcGF0Y2ggZmlsZXNcbiAgPT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgICR7Y2hhbGsuYm9sZChcInBhdGNoLXBhY2thZ2VcIil9IDxwYWNrYWdlLW5hbWU+JHtjaGFsay5pdGFsaWMoXG4gICAgXCJbIDxwYWNrYWdlLW5hbWU+XVwiLFxuICApfVxuXG4gIFdoZW4gZ2l2ZW4gcGFja2FnZSBuYW1lcyBhcyBhcmd1bWVudHMsIHBhdGNoLXBhY2thZ2Ugd2lsbCBjcmVhdGUgcGF0Y2ggZmlsZXNcbiAgYmFzZWQgb24gYW55IGNoYW5nZXMgeW91J3ZlIG1hZGUgdG8gdGhlIHZlcnNpb25zIGluc3RhbGxlZCBieSB5YXJuL25wbS5cblxuICBPcHRpb25zOlxuXG4gICAgICR7Y2hhbGsuYm9sZChcIi0tdXNlLXlhcm5cIil9XG5cbiAgICAgICAgIEJ5IGRlZmF1bHQsIHBhdGNoLXBhY2thZ2UgY2hlY2tzIHdoZXRoZXIgeW91IHVzZSBucG0gb3IgeWFybiBiYXNlZCBvblxuICAgICAgICAgd2hpY2ggbG9ja2ZpbGUgeW91IGhhdmUuIElmIHlvdSBoYXZlIGJvdGgsIGl0IHVzZXMgbnBtIGJ5IGRlZmF1bHQuXG4gICAgICAgICBTZXQgdGhpcyBvcHRpb24gdG8gb3ZlcnJpZGUgdGhhdCBkZWZhdWx0IGFuZCBhbHdheXMgdXNlIHlhcm4uXG5cbiAgICAgJHtjaGFsay5ib2xkKFwiLS1leGNsdWRlIDxyZWdleHA+XCIpfVxuXG4gICAgICAgICBJZ25vcmUgcGF0aHMgbWF0Y2hpbmcgdGhlIHJlZ2V4cCB3aGVuIGNyZWF0aW5nIHBhdGNoIGZpbGVzLlxuICAgICAgICAgUGF0aHMgYXJlIHJlbGF0aXZlIHRvIHRoZSByb290IGRpciBvZiB0aGUgcGFja2FnZSB0byBiZSBwYXRjaGVkLlxuXG4gICAgICAgICBEZWZhdWx0OiAncGFja2FnZVxcXFwuanNvbiQnXG5cbiAgICAgJHtjaGFsay5ib2xkKFwiLS1pbmNsdWRlIDxyZWdleHA+XCIpfVxuXG4gICAgICAgICBPbmx5IGNvbnNpZGVyIHBhdGhzIG1hdGNoaW5nIHRoZSByZWdleHAgd2hlbiBjcmVhdGluZyBwYXRjaCBmaWxlcy5cbiAgICAgICAgIFBhdGhzIGFyZSByZWxhdGl2ZSB0byB0aGUgcm9vdCBkaXIgb2YgdGhlIHBhY2thZ2UgdG8gYmUgcGF0Y2hlZC5cblxuICAgICAgICAgRGVmYXVsdCAnLionXG5cbiAgICAgJHtjaGFsay5ib2xkKFwiLS1jYXNlLXNlbnNpdGl2ZS1wYXRoLWZpbHRlcmluZ1wiKX1cblxuICAgICAgICAgTWFrZSByZWdleHBzIHVzZWQgaW4gLS1pbmNsdWRlIG9yIC0tZXhjbHVkZSBmaWx0ZXJzIGNhc2Utc2Vuc2l0aXZlLlxuYClcbn1cbiJdfQ==