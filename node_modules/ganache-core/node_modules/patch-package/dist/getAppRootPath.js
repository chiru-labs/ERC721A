"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("./path");
var process_1 = __importDefault(require("process"));
var fs_extra_1 = require("fs-extra");
exports.getAppRootPath = function () {
    var cwd = process_1.default.cwd();
    while (!fs_extra_1.existsSync(path_1.join(cwd, "package.json"))) {
        var up = path_1.resolve(cwd, "../");
        if (up === cwd) {
            throw new Error("no package.json found for this project");
        }
        cwd = up;
    }
    return cwd;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QXBwUm9vdFBhdGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZ2V0QXBwUm9vdFBhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQkFBc0M7QUFDdEMsb0RBQTZCO0FBQzdCLHFDQUFxQztBQUV4QixRQUFBLGNBQWMsR0FBRztJQUM1QixJQUFJLEdBQUcsR0FBRyxpQkFBTyxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ3ZCLE9BQU8sQ0FBQyxxQkFBVSxDQUFDLFdBQUksQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRTtRQUM3QyxJQUFNLEVBQUUsR0FBRyxjQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQzlCLElBQUksRUFBRSxLQUFLLEdBQUcsRUFBRTtZQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQTtTQUMxRDtRQUNELEdBQUcsR0FBRyxFQUFFLENBQUE7S0FDVDtJQUNELE9BQU8sR0FBRyxDQUFBO0FBQ1osQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgam9pbiwgcmVzb2x2ZSB9IGZyb20gXCIuL3BhdGhcIlxuaW1wb3J0IHByb2Nlc3MgZnJvbSBcInByb2Nlc3NcIlxuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJmcy1leHRyYVwiXG5cbmV4cG9ydCBjb25zdCBnZXRBcHBSb290UGF0aCA9ICgpOiBzdHJpbmcgPT4ge1xuICBsZXQgY3dkID0gcHJvY2Vzcy5jd2QoKVxuICB3aGlsZSAoIWV4aXN0c1N5bmMoam9pbihjd2QsIFwicGFja2FnZS5qc29uXCIpKSkge1xuICAgIGNvbnN0IHVwID0gcmVzb2x2ZShjd2QsIFwiLi4vXCIpXG4gICAgaWYgKHVwID09PSBjd2QpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vIHBhY2thZ2UuanNvbiBmb3VuZCBmb3IgdGhpcyBwcm9qZWN0XCIpXG4gICAgfVxuICAgIGN3ZCA9IHVwXG4gIH1cbiAgcmV0dXJuIGN3ZFxufVxuIl19