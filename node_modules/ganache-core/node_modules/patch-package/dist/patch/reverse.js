"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parse_1 = require("./parse");
var assertNever_1 = require("../assertNever");
function reverseHunk(hunk) {
    var header = {
        original: hunk.header.patched,
        patched: hunk.header.original,
    };
    var parts = [];
    for (var _i = 0, _a = hunk.parts; _i < _a.length; _i++) {
        var part = _a[_i];
        switch (part.type) {
            case "context":
                parts.push(part);
                break;
            case "deletion":
                parts.push({
                    type: "insertion",
                    lines: part.lines,
                    noNewlineAtEndOfFile: part.noNewlineAtEndOfFile,
                });
                break;
            case "insertion":
                parts.push({
                    type: "deletion",
                    lines: part.lines,
                    noNewlineAtEndOfFile: part.noNewlineAtEndOfFile,
                });
                break;
            default:
                assertNever_1.assertNever(part.type);
        }
    }
    // swap insertions and deletions over so deletions always come first
    for (var i = 0; i < parts.length - 1; i++) {
        if (parts[i].type === "insertion" && parts[i + 1].type === "deletion") {
            var tmp = parts[i];
            parts[i] = parts[i + 1];
            parts[i + 1] = tmp;
            i += 1;
        }
    }
    var result = {
        header: header,
        parts: parts,
    };
    parse_1.verifyHunkIntegrity(result);
    return result;
}
function reversePatchPart(part) {
    switch (part.type) {
        case "file creation":
            return {
                type: "file deletion",
                path: part.path,
                hash: part.hash,
                hunk: part.hunk && reverseHunk(part.hunk),
                mode: part.mode,
            };
        case "file deletion":
            return {
                type: "file creation",
                path: part.path,
                hunk: part.hunk && reverseHunk(part.hunk),
                mode: part.mode,
                hash: part.hash,
            };
        case "rename":
            return {
                type: "rename",
                fromPath: part.toPath,
                toPath: part.fromPath,
            };
        case "patch":
            return {
                type: "patch",
                path: part.path,
                hunks: part.hunks.map(reverseHunk),
                beforeHash: part.afterHash,
                afterHash: part.beforeHash,
            };
        case "mode change":
            return {
                type: "mode change",
                path: part.path,
                newMode: part.oldMode,
                oldMode: part.newMode,
            };
    }
}
exports.reversePatch = function (patch) {
    return patch.map(reversePatchPart).reverse();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV2ZXJzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXRjaC9yZXZlcnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBTWdCO0FBQ2hCLDhDQUE0QztBQUU1QyxTQUFTLFdBQVcsQ0FBQyxJQUFVO0lBQzdCLElBQU0sTUFBTSxHQUFlO1FBQ3pCLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87UUFDN0IsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtLQUM5QixDQUFBO0lBQ0QsSUFBTSxLQUFLLEdBQWtCLEVBQUUsQ0FBQTtJQUUvQixLQUFtQixVQUFVLEVBQVYsS0FBQSxJQUFJLENBQUMsS0FBSyxFQUFWLGNBQVUsRUFBVixJQUFVLEVBQUU7UUFBMUIsSUFBTSxJQUFJLFNBQUE7UUFDYixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDakIsS0FBSyxTQUFTO2dCQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ2hCLE1BQUs7WUFDUCxLQUFLLFVBQVU7Z0JBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDVCxJQUFJLEVBQUUsV0FBVztvQkFDakIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixvQkFBb0IsRUFBRSxJQUFJLENBQUMsb0JBQW9CO2lCQUNoRCxDQUFDLENBQUE7Z0JBQ0YsTUFBSztZQUNQLEtBQUssV0FBVztnQkFDZCxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNULElBQUksRUFBRSxVQUFVO29CQUNoQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxvQkFBb0I7aUJBQ2hELENBQUMsQ0FBQTtnQkFDRixNQUFLO1lBQ1A7Z0JBQ0UseUJBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDekI7S0FDRjtJQUVELG9FQUFvRTtJQUNwRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQVcsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDckUsSUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3BCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQ3ZCLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ2xCLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDUDtLQUNGO0lBRUQsSUFBTSxNQUFNLEdBQVM7UUFDbkIsTUFBTSxRQUFBO1FBQ04sS0FBSyxPQUFBO0tBQ04sQ0FBQTtJQUVELDJCQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRTNCLE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsSUFBbUI7SUFDM0MsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ2pCLEtBQUssZUFBZTtZQUNsQixPQUFPO2dCQUNMLElBQUksRUFBRSxlQUFlO2dCQUNyQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUN6QyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7YUFDaEIsQ0FBQTtRQUNILEtBQUssZUFBZTtZQUNsQixPQUFPO2dCQUNMLElBQUksRUFBRSxlQUFlO2dCQUNyQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3pDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7YUFDaEIsQ0FBQTtRQUNILEtBQUssUUFBUTtZQUNYLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNyQixNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVE7YUFDdEIsQ0FBQTtRQUNILEtBQUssT0FBTztZQUNWLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Z0JBQ2xDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVO2FBQzNCLENBQUE7UUFDSCxLQUFLLGFBQWE7WUFDaEIsT0FBTztnQkFDTCxJQUFJLEVBQUUsYUFBYTtnQkFDbkIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDckIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO2FBQ3RCLENBQUE7S0FDSjtBQUNILENBQUM7QUFFWSxRQUFBLFlBQVksR0FBRyxVQUFDLEtBQXNCO0lBQ2pELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzlDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFBhcnNlZFBhdGNoRmlsZSxcbiAgUGF0Y2hGaWxlUGFydCxcbiAgSHVuayxcbiAgSHVua0hlYWRlcixcbiAgdmVyaWZ5SHVua0ludGVncml0eSxcbn0gZnJvbSBcIi4vcGFyc2VcIlxuaW1wb3J0IHsgYXNzZXJ0TmV2ZXIgfSBmcm9tIFwiLi4vYXNzZXJ0TmV2ZXJcIlxuXG5mdW5jdGlvbiByZXZlcnNlSHVuayhodW5rOiBIdW5rKTogSHVuayB7XG4gIGNvbnN0IGhlYWRlcjogSHVua0hlYWRlciA9IHtcbiAgICBvcmlnaW5hbDogaHVuay5oZWFkZXIucGF0Y2hlZCxcbiAgICBwYXRjaGVkOiBodW5rLmhlYWRlci5vcmlnaW5hbCxcbiAgfVxuICBjb25zdCBwYXJ0czogSHVua1tcInBhcnRzXCJdID0gW11cblxuICBmb3IgKGNvbnN0IHBhcnQgb2YgaHVuay5wYXJ0cykge1xuICAgIHN3aXRjaCAocGFydC50eXBlKSB7XG4gICAgICBjYXNlIFwiY29udGV4dFwiOlxuICAgICAgICBwYXJ0cy5wdXNoKHBhcnQpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwiZGVsZXRpb25cIjpcbiAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJpbnNlcnRpb25cIixcbiAgICAgICAgICBsaW5lczogcGFydC5saW5lcyxcbiAgICAgICAgICBub05ld2xpbmVBdEVuZE9mRmlsZTogcGFydC5ub05ld2xpbmVBdEVuZE9mRmlsZSxcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJpbnNlcnRpb25cIjpcbiAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJkZWxldGlvblwiLFxuICAgICAgICAgIGxpbmVzOiBwYXJ0LmxpbmVzLFxuICAgICAgICAgIG5vTmV3bGluZUF0RW5kT2ZGaWxlOiBwYXJ0Lm5vTmV3bGluZUF0RW5kT2ZGaWxlLFxuICAgICAgICB9KVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXNzZXJ0TmV2ZXIocGFydC50eXBlKVxuICAgIH1cbiAgfVxuXG4gIC8vIHN3YXAgaW5zZXJ0aW9ucyBhbmQgZGVsZXRpb25zIG92ZXIgc28gZGVsZXRpb25zIGFsd2F5cyBjb21lIGZpcnN0XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgaWYgKHBhcnRzW2ldLnR5cGUgPT09IFwiaW5zZXJ0aW9uXCIgJiYgcGFydHNbaSArIDFdLnR5cGUgPT09IFwiZGVsZXRpb25cIikge1xuICAgICAgY29uc3QgdG1wID0gcGFydHNbaV1cbiAgICAgIHBhcnRzW2ldID0gcGFydHNbaSArIDFdXG4gICAgICBwYXJ0c1tpICsgMV0gPSB0bXBcbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlc3VsdDogSHVuayA9IHtcbiAgICBoZWFkZXIsXG4gICAgcGFydHMsXG4gIH1cblxuICB2ZXJpZnlIdW5rSW50ZWdyaXR5KHJlc3VsdClcblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIHJldmVyc2VQYXRjaFBhcnQocGFydDogUGF0Y2hGaWxlUGFydCk6IFBhdGNoRmlsZVBhcnQge1xuICBzd2l0Y2ggKHBhcnQudHlwZSkge1xuICAgIGNhc2UgXCJmaWxlIGNyZWF0aW9uXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcImZpbGUgZGVsZXRpb25cIixcbiAgICAgICAgcGF0aDogcGFydC5wYXRoLFxuICAgICAgICBoYXNoOiBwYXJ0Lmhhc2gsXG4gICAgICAgIGh1bms6IHBhcnQuaHVuayAmJiByZXZlcnNlSHVuayhwYXJ0Lmh1bmspLFxuICAgICAgICBtb2RlOiBwYXJ0Lm1vZGUsXG4gICAgICB9XG4gICAgY2FzZSBcImZpbGUgZGVsZXRpb25cIjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiZmlsZSBjcmVhdGlvblwiLFxuICAgICAgICBwYXRoOiBwYXJ0LnBhdGgsXG4gICAgICAgIGh1bms6IHBhcnQuaHVuayAmJiByZXZlcnNlSHVuayhwYXJ0Lmh1bmspLFxuICAgICAgICBtb2RlOiBwYXJ0Lm1vZGUsXG4gICAgICAgIGhhc2g6IHBhcnQuaGFzaCxcbiAgICAgIH1cbiAgICBjYXNlIFwicmVuYW1lXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcInJlbmFtZVwiLFxuICAgICAgICBmcm9tUGF0aDogcGFydC50b1BhdGgsXG4gICAgICAgIHRvUGF0aDogcGFydC5mcm9tUGF0aCxcbiAgICAgIH1cbiAgICBjYXNlIFwicGF0Y2hcIjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwicGF0Y2hcIixcbiAgICAgICAgcGF0aDogcGFydC5wYXRoLFxuICAgICAgICBodW5rczogcGFydC5odW5rcy5tYXAocmV2ZXJzZUh1bmspLFxuICAgICAgICBiZWZvcmVIYXNoOiBwYXJ0LmFmdGVySGFzaCxcbiAgICAgICAgYWZ0ZXJIYXNoOiBwYXJ0LmJlZm9yZUhhc2gsXG4gICAgICB9XG4gICAgY2FzZSBcIm1vZGUgY2hhbmdlXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIm1vZGUgY2hhbmdlXCIsXG4gICAgICAgIHBhdGg6IHBhcnQucGF0aCxcbiAgICAgICAgbmV3TW9kZTogcGFydC5vbGRNb2RlLFxuICAgICAgICBvbGRNb2RlOiBwYXJ0Lm5ld01vZGUsXG4gICAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJldmVyc2VQYXRjaCA9IChwYXRjaDogUGFyc2VkUGF0Y2hGaWxlKTogUGFyc2VkUGF0Y2hGaWxlID0+IHtcbiAgcmV0dXJuIHBhdGNoLm1hcChyZXZlcnNlUGF0Y2hQYXJ0KS5yZXZlcnNlKClcbn1cbiJdfQ==