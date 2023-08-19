"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var packageIsDevDependency_1 = require("./packageIsDevDependency");
var path_1 = require("./path");
var path_2 = require("path");
var PackageDetails_1 = require("./PackageDetails");
var fs_1 = require("fs");
var appPath = path_2.normalize(path_1.join(__dirname, "../"));
describe(packageIsDevDependency_1.packageIsDevDependency, function () {
    it("returns true if package is a dev dependency", function () {
        expect(packageIsDevDependency_1.packageIsDevDependency({
            appPath: appPath,
            packageDetails: PackageDetails_1.getPackageDetailsFromPatchFilename("typescript+3.0.1.patch"),
        })).toBe(true);
    });
    it("returns false if package is not a dev dependency", function () {
        expect(packageIsDevDependency_1.packageIsDevDependency({
            appPath: appPath,
            packageDetails: PackageDetails_1.getPackageDetailsFromPatchFilename("chalk+3.0.1.patch"),
        })).toBe(false);
    });
    it("returns false if package is a transitive dependency of a dev dependency", function () {
        expect(fs_1.existsSync(path_1.join(appPath, "node_modules/cosmiconfig"))).toBe(true);
        expect(packageIsDevDependency_1.packageIsDevDependency({
            appPath: appPath,
            packageDetails: PackageDetails_1.getPackageDetailsFromPatchFilename(
            // cosmiconfig is a transitive dep of lint-staged
            "cosmiconfig+3.0.1.patch"),
        })).toBe(false);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZUlzRGV2RGVwZW5kZW5jeS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BhY2thZ2VJc0RldkRlcGVuZGVuY3kudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1FQUFpRTtBQUNqRSwrQkFBNkI7QUFDN0IsNkJBQWdDO0FBQ2hDLG1EQUFxRTtBQUNyRSx5QkFBK0I7QUFFL0IsSUFBTSxPQUFPLEdBQUcsZ0JBQVMsQ0FBQyxXQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFFakQsUUFBUSxDQUFDLCtDQUFzQixFQUFFO0lBQy9CLEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRTtRQUNoRCxNQUFNLENBQ0osK0NBQXNCLENBQUM7WUFDckIsT0FBTyxTQUFBO1lBQ1AsY0FBYyxFQUFFLG1EQUFrQyxDQUNoRCx3QkFBd0IsQ0FDeEI7U0FDSCxDQUFDLENBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDZCxDQUFDLENBQUMsQ0FBQTtJQUNGLEVBQUUsQ0FBQyxrREFBa0QsRUFBRTtRQUNyRCxNQUFNLENBQ0osK0NBQXNCLENBQUM7WUFDckIsT0FBTyxTQUFBO1lBQ1AsY0FBYyxFQUFFLG1EQUFrQyxDQUNoRCxtQkFBbUIsQ0FDbkI7U0FDSCxDQUFDLENBQ0gsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDZixDQUFDLENBQUMsQ0FBQTtJQUNGLEVBQUUsQ0FBQyx5RUFBeUUsRUFBRTtRQUM1RSxNQUFNLENBQUMsZUFBVSxDQUFDLFdBQUksQ0FBQyxPQUFPLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3hFLE1BQU0sQ0FDSiwrQ0FBc0IsQ0FBQztZQUNyQixPQUFPLFNBQUE7WUFDUCxjQUFjLEVBQUUsbURBQWtDO1lBQ2hELGlEQUFpRDtZQUNqRCx5QkFBeUIsQ0FDekI7U0FDSCxDQUFDLENBQ0gsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDZixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGFja2FnZUlzRGV2RGVwZW5kZW5jeSB9IGZyb20gXCIuL3BhY2thZ2VJc0RldkRlcGVuZGVuY3lcIlxuaW1wb3J0IHsgam9pbiB9IGZyb20gXCIuL3BhdGhcIlxuaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSBcInBhdGhcIlxuaW1wb3J0IHsgZ2V0UGFja2FnZURldGFpbHNGcm9tUGF0Y2hGaWxlbmFtZSB9IGZyb20gXCIuL1BhY2thZ2VEZXRhaWxzXCJcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwiZnNcIlxuXG5jb25zdCBhcHBQYXRoID0gbm9ybWFsaXplKGpvaW4oX19kaXJuYW1lLCBcIi4uL1wiKSlcblxuZGVzY3JpYmUocGFja2FnZUlzRGV2RGVwZW5kZW5jeSwgKCkgPT4ge1xuICBpdChcInJldHVybnMgdHJ1ZSBpZiBwYWNrYWdlIGlzIGEgZGV2IGRlcGVuZGVuY3lcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChcbiAgICAgIHBhY2thZ2VJc0RldkRlcGVuZGVuY3koe1xuICAgICAgICBhcHBQYXRoLFxuICAgICAgICBwYWNrYWdlRGV0YWlsczogZ2V0UGFja2FnZURldGFpbHNGcm9tUGF0Y2hGaWxlbmFtZShcbiAgICAgICAgICBcInR5cGVzY3JpcHQrMy4wLjEucGF0Y2hcIixcbiAgICAgICAgKSEsXG4gICAgICB9KSxcbiAgICApLnRvQmUodHJ1ZSlcbiAgfSlcbiAgaXQoXCJyZXR1cm5zIGZhbHNlIGlmIHBhY2thZ2UgaXMgbm90IGEgZGV2IGRlcGVuZGVuY3lcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChcbiAgICAgIHBhY2thZ2VJc0RldkRlcGVuZGVuY3koe1xuICAgICAgICBhcHBQYXRoLFxuICAgICAgICBwYWNrYWdlRGV0YWlsczogZ2V0UGFja2FnZURldGFpbHNGcm9tUGF0Y2hGaWxlbmFtZShcbiAgICAgICAgICBcImNoYWxrKzMuMC4xLnBhdGNoXCIsXG4gICAgICAgICkhLFxuICAgICAgfSksXG4gICAgKS50b0JlKGZhbHNlKVxuICB9KVxuICBpdChcInJldHVybnMgZmFsc2UgaWYgcGFja2FnZSBpcyBhIHRyYW5zaXRpdmUgZGVwZW5kZW5jeSBvZiBhIGRldiBkZXBlbmRlbmN5XCIsICgpID0+IHtcbiAgICBleHBlY3QoZXhpc3RzU3luYyhqb2luKGFwcFBhdGgsIFwibm9kZV9tb2R1bGVzL2Nvc21pY29uZmlnXCIpKSkudG9CZSh0cnVlKVxuICAgIGV4cGVjdChcbiAgICAgIHBhY2thZ2VJc0RldkRlcGVuZGVuY3koe1xuICAgICAgICBhcHBQYXRoLFxuICAgICAgICBwYWNrYWdlRGV0YWlsczogZ2V0UGFja2FnZURldGFpbHNGcm9tUGF0Y2hGaWxlbmFtZShcbiAgICAgICAgICAvLyBjb3NtaWNvbmZpZyBpcyBhIHRyYW5zaXRpdmUgZGVwIG9mIGxpbnQtc3RhZ2VkXG4gICAgICAgICAgXCJjb3NtaWNvbmZpZyszLjAuMS5wYXRjaFwiLFxuICAgICAgICApISxcbiAgICAgIH0pLFxuICAgICkudG9CZShmYWxzZSlcbiAgfSlcbn0pXG4iXX0=