"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var fs_extra_1 = require("fs-extra");
var path_1 = require("../path");
var path_2 = require("path");
var parse_1 = require("./parse");
function readPatch(_a) {
    var patchFilePath = _a.patchFilePath, packageDetails = _a.packageDetails, patchDir = _a.patchDir;
    try {
        return parse_1.parsePatchFile(fs_extra_1.readFileSync(patchFilePath).toString());
    }
    catch (e) {
        var fixupSteps = [];
        var relativePatchFilePath = path_2.normalize(path_1.relative(process.cwd(), patchFilePath));
        var patchBaseDir = relativePatchFilePath.slice(0, relativePatchFilePath.indexOf(patchDir));
        if (patchBaseDir) {
            fixupSteps.push("cd " + patchBaseDir);
        }
        fixupSteps.push("patch -p1 -i " + relativePatchFilePath.slice(relativePatchFilePath.indexOf(patchDir)));
        fixupSteps.push("npx patch-package " + packageDetails.pathSpecifier);
        if (patchBaseDir) {
            fixupSteps.push("cd " + path_1.relative(path_1.resolve(process.cwd(), patchBaseDir), process.cwd()));
        }
        console.error("\n" + chalk_1.default.red.bold("**ERROR**") + " " + chalk_1.default.red("Failed to apply patch for package " + chalk_1.default.bold(packageDetails.humanReadablePathSpecifier)) + "\n    \n  This happened because the patch file " + relativePatchFilePath + " could not be parsed.\n   \n  If you just upgraded patch-package, you can try running:\n  \n    " + fixupSteps.join("\n    ") + "\n    \n  Otherwise, try manually creating the patch file again.\n  \n  If the problem persists, please submit a bug report:\n  \n    https://github.com/ds300/patch-package/issues/new?title=Patch+file+parse+error&body=%3CPlease+attach+the+patch+file+in+question%3E\n\n");
        process.exit(1);
    }
    return [];
}
exports.readPatch = readPatch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9yZWFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsZ0RBQXlCO0FBQ3pCLHFDQUF1QztBQUN2QyxnQ0FBMkM7QUFDM0MsNkJBQWdDO0FBRWhDLGlDQUF1RDtBQUV2RCxTQUFnQixTQUFTLENBQUMsRUFRekI7UUFQQyxnQ0FBYSxFQUNiLGtDQUFjLEVBQ2Qsc0JBQVE7SUFNUixJQUFJO1FBQ0YsT0FBTyxzQkFBYyxDQUFDLHVCQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtLQUM5RDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBTSxVQUFVLEdBQWEsRUFBRSxDQUFBO1FBQy9CLElBQU0scUJBQXFCLEdBQUcsZ0JBQVMsQ0FDckMsZUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FDdkMsQ0FBQTtRQUNELElBQU0sWUFBWSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FDOUMsQ0FBQyxFQUNELHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FDeEMsQ0FBQTtRQUNELElBQUksWUFBWSxFQUFFO1lBQ2hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBTSxZQUFjLENBQUMsQ0FBQTtTQUN0QztRQUNELFVBQVUsQ0FBQyxJQUFJLENBQ2Isa0JBQWdCLHFCQUFxQixDQUFDLEtBQUssQ0FDekMscUJBQXFCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUN0QyxDQUNKLENBQUE7UUFDRCxVQUFVLENBQUMsSUFBSSxDQUFDLHVCQUFxQixjQUFjLENBQUMsYUFBZSxDQUFDLENBQUE7UUFDcEUsSUFBSSxZQUFZLEVBQUU7WUFDaEIsVUFBVSxDQUFDLElBQUksQ0FDYixRQUFNLGVBQVEsQ0FBQyxjQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFlBQVksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBRyxDQUN0RSxDQUFBO1NBQ0Y7UUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQ2hCLGVBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFJLGVBQUssQ0FBQyxHQUFHLENBQ3BDLHVDQUFxQyxlQUFLLENBQUMsSUFBSSxDQUM3QyxjQUFjLENBQUMsMEJBQTBCLENBQ3hDLENBQ0osdURBRW9DLHFCQUFxQix3R0FJeEQsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaVJBUTlCLENBQUMsQ0FBQTtRQUNFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEI7SUFDRCxPQUFPLEVBQUUsQ0FBQTtBQUNYLENBQUM7QUExREQsOEJBMERDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gXCJjaGFsa1wiXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tIFwiZnMtZXh0cmFcIlxuaW1wb3J0IHsgcmVsYXRpdmUsIHJlc29sdmUgfSBmcm9tIFwiLi4vcGF0aFwiXG5pbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tIFwicGF0aFwiXG5pbXBvcnQgeyBQYWNrYWdlRGV0YWlscyB9IGZyb20gXCIuLi9QYWNrYWdlRGV0YWlsc1wiXG5pbXBvcnQgeyBwYXJzZVBhdGNoRmlsZSwgUGF0Y2hGaWxlUGFydCB9IGZyb20gXCIuL3BhcnNlXCJcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRQYXRjaCh7XG4gIHBhdGNoRmlsZVBhdGgsXG4gIHBhY2thZ2VEZXRhaWxzLFxuICBwYXRjaERpcixcbn06IHtcbiAgcGF0Y2hGaWxlUGF0aDogc3RyaW5nXG4gIHBhY2thZ2VEZXRhaWxzOiBQYWNrYWdlRGV0YWlsc1xuICBwYXRjaERpcjogc3RyaW5nXG59KTogUGF0Y2hGaWxlUGFydFtdIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcGFyc2VQYXRjaEZpbGUocmVhZEZpbGVTeW5jKHBhdGNoRmlsZVBhdGgpLnRvU3RyaW5nKCkpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zdCBmaXh1cFN0ZXBzOiBzdHJpbmdbXSA9IFtdXG4gICAgY29uc3QgcmVsYXRpdmVQYXRjaEZpbGVQYXRoID0gbm9ybWFsaXplKFxuICAgICAgcmVsYXRpdmUocHJvY2Vzcy5jd2QoKSwgcGF0Y2hGaWxlUGF0aCksXG4gICAgKVxuICAgIGNvbnN0IHBhdGNoQmFzZURpciA9IHJlbGF0aXZlUGF0Y2hGaWxlUGF0aC5zbGljZShcbiAgICAgIDAsXG4gICAgICByZWxhdGl2ZVBhdGNoRmlsZVBhdGguaW5kZXhPZihwYXRjaERpciksXG4gICAgKVxuICAgIGlmIChwYXRjaEJhc2VEaXIpIHtcbiAgICAgIGZpeHVwU3RlcHMucHVzaChgY2QgJHtwYXRjaEJhc2VEaXJ9YClcbiAgICB9XG4gICAgZml4dXBTdGVwcy5wdXNoKFxuICAgICAgYHBhdGNoIC1wMSAtaSAke3JlbGF0aXZlUGF0Y2hGaWxlUGF0aC5zbGljZShcbiAgICAgICAgcmVsYXRpdmVQYXRjaEZpbGVQYXRoLmluZGV4T2YocGF0Y2hEaXIpLFxuICAgICAgKX1gLFxuICAgIClcbiAgICBmaXh1cFN0ZXBzLnB1c2goYG5weCBwYXRjaC1wYWNrYWdlICR7cGFja2FnZURldGFpbHMucGF0aFNwZWNpZmllcn1gKVxuICAgIGlmIChwYXRjaEJhc2VEaXIpIHtcbiAgICAgIGZpeHVwU3RlcHMucHVzaChcbiAgICAgICAgYGNkICR7cmVsYXRpdmUocmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBwYXRjaEJhc2VEaXIpLCBwcm9jZXNzLmN3ZCgpKX1gLFxuICAgICAgKVxuICAgIH1cblxuICAgIGNvbnNvbGUuZXJyb3IoYFxuJHtjaGFsay5yZWQuYm9sZChcIioqRVJST1IqKlwiKX0gJHtjaGFsay5yZWQoXG4gICAgICBgRmFpbGVkIHRvIGFwcGx5IHBhdGNoIGZvciBwYWNrYWdlICR7Y2hhbGsuYm9sZChcbiAgICAgICAgcGFja2FnZURldGFpbHMuaHVtYW5SZWFkYWJsZVBhdGhTcGVjaWZpZXIsXG4gICAgICApfWAsXG4gICAgKX1cbiAgICBcbiAgVGhpcyBoYXBwZW5lZCBiZWNhdXNlIHRoZSBwYXRjaCBmaWxlICR7cmVsYXRpdmVQYXRjaEZpbGVQYXRofSBjb3VsZCBub3QgYmUgcGFyc2VkLlxuICAgXG4gIElmIHlvdSBqdXN0IHVwZ3JhZGVkIHBhdGNoLXBhY2thZ2UsIHlvdSBjYW4gdHJ5IHJ1bm5pbmc6XG4gIFxuICAgICR7Zml4dXBTdGVwcy5qb2luKFwiXFxuICAgIFwiKX1cbiAgICBcbiAgT3RoZXJ3aXNlLCB0cnkgbWFudWFsbHkgY3JlYXRpbmcgdGhlIHBhdGNoIGZpbGUgYWdhaW4uXG4gIFxuICBJZiB0aGUgcHJvYmxlbSBwZXJzaXN0cywgcGxlYXNlIHN1Ym1pdCBhIGJ1ZyByZXBvcnQ6XG4gIFxuICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9kczMwMC9wYXRjaC1wYWNrYWdlL2lzc3Vlcy9uZXc/dGl0bGU9UGF0Y2grZmlsZStwYXJzZStlcnJvciZib2R5PSUzQ1BsZWFzZSthdHRhY2grdGhlK3BhdGNoK2ZpbGUraW4rcXVlc3Rpb24lM0VcblxuYClcbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxuICByZXR1cm4gW11cbn1cbiJdfQ==