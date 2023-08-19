"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var slash_1 = __importDefault(require("slash"));
var path_1 = __importDefault(require("path"));
exports.join = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return slash_1.default(path_1.default.join.apply(path_1.default, args));
};
var path_2 = require("path");
exports.dirname = path_2.dirname;
exports.resolve = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return slash_1.default(path_1.default.resolve.apply(path_1.default, args));
};
exports.relative = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return slash_1.default(path_1.default.relative.apply(path_1.default, args));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsZ0RBQXlCO0FBQ3pCLDhDQUF1QjtBQUVWLFFBQUEsSUFBSSxHQUFxQjtJQUFDLGNBQU87U0FBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1FBQVAseUJBQU87O0lBQUssT0FBQSxlQUFLLENBQUMsY0FBSSxDQUFDLElBQUksT0FBVCxjQUFJLEVBQVMsSUFBSSxFQUFFO0FBQXpCLENBQXlCLENBQUE7QUFFNUUsNkJBQThCO0FBQXJCLHlCQUFBLE9BQU8sQ0FBQTtBQUVILFFBQUEsT0FBTyxHQUF3QjtJQUFDLGNBQU87U0FBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1FBQVAseUJBQU87O0lBQ2xELE9BQUEsZUFBSyxDQUFDLGNBQUksQ0FBQyxPQUFPLE9BQVosY0FBSSxFQUFZLElBQUksRUFBRTtBQUE1QixDQUE0QixDQUFBO0FBRWpCLFFBQUEsUUFBUSxHQUF5QjtJQUFDLGNBQU87U0FBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1FBQVAseUJBQU87O0lBQ3BELE9BQUEsZUFBSyxDQUFDLGNBQUksQ0FBQyxRQUFRLE9BQWIsY0FBSSxFQUFhLElBQUksRUFBRTtBQUE3QixDQUE2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNsYXNoIGZyb20gXCJzbGFzaFwiXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiXG5cbmV4cG9ydCBjb25zdCBqb2luOiB0eXBlb2YgcGF0aC5qb2luID0gKC4uLmFyZ3MpID0+IHNsYXNoKHBhdGguam9pbiguLi5hcmdzKSlcblxuZXhwb3J0IHsgZGlybmFtZSB9IGZyb20gXCJwYXRoXCJcblxuZXhwb3J0IGNvbnN0IHJlc29sdmU6IHR5cGVvZiBwYXRoLnJlc29sdmUgPSAoLi4uYXJncykgPT5cbiAgc2xhc2gocGF0aC5yZXNvbHZlKC4uLmFyZ3MpKVxuXG5leHBvcnQgY29uc3QgcmVsYXRpdmU6IHR5cGVvZiBwYXRoLnJlbGF0aXZlID0gKC4uLmFyZ3MpID0+XG4gIHNsYXNoKHBhdGgucmVsYXRpdmUoLi4uYXJncykpXG4iXX0=