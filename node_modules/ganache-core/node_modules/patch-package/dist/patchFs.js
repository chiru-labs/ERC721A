"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("./path");
var klaw_sync_1 = __importDefault(require("klaw-sync"));
exports.getPatchFiles = function (patchesDir) {
    try {
        return klaw_sync_1.default(patchesDir, { nodir: true })
            .map(function (_a) {
            var path = _a.path;
            return path_1.relative(patchesDir, path);
        })
            .filter(function (path) { return path.endsWith(".patch"); });
    }
    catch (e) {
        return [];
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0Y2hGcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXRjaEZzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsK0JBQWlDO0FBQ2pDLHdEQUFnQztBQUVuQixRQUFBLGFBQWEsR0FBRyxVQUFDLFVBQWtCO0lBQzlDLElBQUk7UUFDRixPQUFPLG1CQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO2FBQ3pDLEdBQUcsQ0FBQyxVQUFDLEVBQVE7Z0JBQU4sY0FBSTtZQUFPLE9BQUEsZUFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUM7UUFBMUIsQ0FBMEIsQ0FBQzthQUM3QyxNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUF2QixDQUF1QixDQUFDLENBQUE7S0FDM0M7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sRUFBRSxDQUFBO0tBQ1Y7QUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWxhdGl2ZSB9IGZyb20gXCIuL3BhdGhcIlxuaW1wb3J0IGtsYXdTeW5jIGZyb20gXCJrbGF3LXN5bmNcIlxuXG5leHBvcnQgY29uc3QgZ2V0UGF0Y2hGaWxlcyA9IChwYXRjaGVzRGlyOiBzdHJpbmcpID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4ga2xhd1N5bmMocGF0Y2hlc0RpciwgeyBub2RpcjogdHJ1ZSB9KVxuICAgICAgLm1hcCgoeyBwYXRoIH0pID0+IHJlbGF0aXZlKHBhdGNoZXNEaXIsIHBhdGgpKVxuICAgICAgLmZpbHRlcihwYXRoID0+IHBhdGguZW5kc1dpdGgoXCIucGF0Y2hcIikpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gW11cbiAgfVxufVxuIl19