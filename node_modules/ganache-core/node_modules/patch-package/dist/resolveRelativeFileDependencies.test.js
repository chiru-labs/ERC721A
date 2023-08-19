"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var resolveRelativeFileDependencies_1 = require("./resolveRelativeFileDependencies");
describe("resolveRelativeFileDependencies", function () {
    it("works for package.json", function () {
        var appRootPath = "/foo/bar";
        var resolutions = {
            absolute: "file:/not-foo/bar",
            relative: "file:../baz",
            remote: "git+https://blah.com/blah.git",
            version: "^434.34.34",
        };
        var expected = {
            absolute: "file:/not-foo/bar",
            relative: "file:/foo/baz",
            remote: "git+https://blah.com/blah.git",
            version: "^434.34.34",
        };
        expect(resolveRelativeFileDependencies_1.resolveRelativeFileDependencies(appRootPath, JSON.parse(JSON.stringify(resolutions)))).toEqual(expected);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZVJlbGF0aXZlRmlsZURlcGVuZGVuY2llcy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc29sdmVSZWxhdGl2ZUZpbGVEZXBlbmRlbmNpZXMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFGQUFtRjtBQUVuRixRQUFRLENBQUMsaUNBQWlDLEVBQUU7SUFDMUMsRUFBRSxDQUFDLHdCQUF3QixFQUFFO1FBQzNCLElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQTtRQUU5QixJQUFNLFdBQVcsR0FBRztZQUNsQixRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLFFBQVEsRUFBRSxhQUFhO1lBQ3ZCLE1BQU0sRUFBRSwrQkFBK0I7WUFDdkMsT0FBTyxFQUFFLFlBQVk7U0FDdEIsQ0FBQTtRQUVELElBQU0sUUFBUSxHQUFHO1lBQ2YsUUFBUSxFQUFFLG1CQUFtQjtZQUM3QixRQUFRLEVBQUUsZUFBZTtZQUN6QixNQUFNLEVBQUUsK0JBQStCO1lBQ3ZDLE9BQU8sRUFBRSxZQUFZO1NBQ3RCLENBQUE7UUFFRCxNQUFNLENBQ0osaUVBQStCLENBQzdCLFdBQVcsRUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FDeEMsQ0FDRixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNyQixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmVzb2x2ZVJlbGF0aXZlRmlsZURlcGVuZGVuY2llcyB9IGZyb20gXCIuL3Jlc29sdmVSZWxhdGl2ZUZpbGVEZXBlbmRlbmNpZXNcIlxuXG5kZXNjcmliZShcInJlc29sdmVSZWxhdGl2ZUZpbGVEZXBlbmRlbmNpZXNcIiwgKCkgPT4ge1xuICBpdChcIndvcmtzIGZvciBwYWNrYWdlLmpzb25cIiwgKCkgPT4ge1xuICAgIGNvbnN0IGFwcFJvb3RQYXRoID0gXCIvZm9vL2JhclwiXG5cbiAgICBjb25zdCByZXNvbHV0aW9ucyA9IHtcbiAgICAgIGFic29sdXRlOiBcImZpbGU6L25vdC1mb28vYmFyXCIsXG4gICAgICByZWxhdGl2ZTogXCJmaWxlOi4uL2JhelwiLFxuICAgICAgcmVtb3RlOiBcImdpdCtodHRwczovL2JsYWguY29tL2JsYWguZ2l0XCIsXG4gICAgICB2ZXJzaW9uOiBcIl40MzQuMzQuMzRcIixcbiAgICB9XG5cbiAgICBjb25zdCBleHBlY3RlZCA9IHtcbiAgICAgIGFic29sdXRlOiBcImZpbGU6L25vdC1mb28vYmFyXCIsXG4gICAgICByZWxhdGl2ZTogXCJmaWxlOi9mb28vYmF6XCIsXG4gICAgICByZW1vdGU6IFwiZ2l0K2h0dHBzOi8vYmxhaC5jb20vYmxhaC5naXRcIixcbiAgICAgIHZlcnNpb246IFwiXjQzNC4zNC4zNFwiLFxuICAgIH1cblxuICAgIGV4cGVjdChcbiAgICAgIHJlc29sdmVSZWxhdGl2ZUZpbGVEZXBlbmRlbmNpZXMoXG4gICAgICAgIGFwcFJvb3RQYXRoLFxuICAgICAgICBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlc29sdXRpb25zKSksXG4gICAgICApLFxuICAgICkudG9FcXVhbChleHBlY3RlZClcbiAgfSlcbn0pXG4iXX0=