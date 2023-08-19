"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("./path");
var fs_extra_1 = require("fs-extra");
var klaw_sync_1 = __importDefault(require("klaw-sync"));
function removeIgnoredFiles(dir, includePaths, excludePaths) {
    klaw_sync_1.default(dir, { nodir: true })
        .map(function (item) { return item.path.slice((dir + "/").length); })
        .filter(function (relativePath) {
        return !relativePath.match(includePaths) || relativePath.match(excludePaths);
    })
        .forEach(function (relativePath) { return fs_extra_1.removeSync(path_1.join(dir, relativePath)); });
}
exports.removeIgnoredFiles = removeIgnoredFiles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyRmlsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZmlsdGVyRmlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQkFBNkI7QUFDN0IscUNBQXFDO0FBQ3JDLHdEQUFnQztBQUVoQyxTQUFnQixrQkFBa0IsQ0FDaEMsR0FBVyxFQUNYLFlBQW9CLEVBQ3BCLFlBQW9CO0lBRXBCLG1CQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO1NBQzNCLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUcsR0FBRyxNQUFHLENBQUEsQ0FBQyxNQUFNLENBQUMsRUFBakMsQ0FBaUMsQ0FBQztTQUM5QyxNQUFNLENBQ0wsVUFBQSxZQUFZO1FBQ1YsT0FBQSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFBckUsQ0FBcUUsQ0FDeEU7U0FDQSxPQUFPLENBQUMsVUFBQSxZQUFZLElBQUksT0FBQSxxQkFBVSxDQUFDLFdBQUksQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUMsRUFBbkMsQ0FBbUMsQ0FBQyxDQUFBO0FBQ2pFLENBQUM7QUFaRCxnREFZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tIFwiLi9wYXRoXCJcbmltcG9ydCB7IHJlbW92ZVN5bmMgfSBmcm9tIFwiZnMtZXh0cmFcIlxuaW1wb3J0IGtsYXdTeW5jIGZyb20gXCJrbGF3LXN5bmNcIlxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlSWdub3JlZEZpbGVzKFxuICBkaXI6IHN0cmluZyxcbiAgaW5jbHVkZVBhdGhzOiBSZWdFeHAsXG4gIGV4Y2x1ZGVQYXRoczogUmVnRXhwLFxuKSB7XG4gIGtsYXdTeW5jKGRpciwgeyBub2RpcjogdHJ1ZSB9KVxuICAgIC5tYXAoaXRlbSA9PiBpdGVtLnBhdGguc2xpY2UoYCR7ZGlyfS9gLmxlbmd0aCkpXG4gICAgLmZpbHRlcihcbiAgICAgIHJlbGF0aXZlUGF0aCA9PlxuICAgICAgICAhcmVsYXRpdmVQYXRoLm1hdGNoKGluY2x1ZGVQYXRocykgfHwgcmVsYXRpdmVQYXRoLm1hdGNoKGV4Y2x1ZGVQYXRocyksXG4gICAgKVxuICAgIC5mb3JFYWNoKHJlbGF0aXZlUGF0aCA9PiByZW1vdmVTeW5jKGpvaW4oZGlyLCByZWxhdGl2ZVBhdGgpKSlcbn1cbiJdfQ==