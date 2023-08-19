"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("./path");
function parseNameAndVersion(s) {
    var parts = s.split("+");
    switch (parts.length) {
        case 1: {
            return { name: parts[0] };
        }
        case 2: {
            var nameOrScope = parts[0], versionOrName = parts[1];
            if (versionOrName.match(/^\d+/)) {
                return {
                    name: nameOrScope,
                    version: versionOrName,
                };
            }
            return { name: nameOrScope + "/" + versionOrName };
        }
        case 3: {
            var scope = parts[0], name = parts[1], version = parts[2];
            return { name: scope + "/" + name, version: version };
        }
    }
    return null;
}
function getPackageDetailsFromPatchFilename(patchFilename) {
    var legacyMatch = patchFilename.match(/^([^+=]+?)(:|\+)(\d+\.\d+\.\d+.*)(\.dev)?\.patch$/);
    if (legacyMatch) {
        var name = legacyMatch[1];
        var version = legacyMatch[3];
        return {
            packageNames: [name],
            pathSpecifier: name,
            humanReadablePathSpecifier: name,
            path: path_1.join("node_modules", name),
            name: name,
            version: version,
            isNested: false,
            patchFilename: patchFilename,
            isDevOnly: patchFilename.endsWith(".dev.patch"),
        };
    }
    var parts = patchFilename
        .replace(/(\.dev)?\.patch$/, "")
        .split("++")
        .map(parseNameAndVersion)
        .filter(function (x) { return x !== null; });
    if (parts.length === 0) {
        return null;
    }
    var lastPart = parts[parts.length - 1];
    if (!lastPart.version) {
        return null;
    }
    return {
        name: lastPart.name,
        version: lastPart.version,
        path: path_1.join("node_modules", parts.map(function (_a) {
            var name = _a.name;
            return name;
        }).join("/node_modules/")),
        patchFilename: patchFilename,
        pathSpecifier: parts.map(function (_a) {
            var name = _a.name;
            return name;
        }).join("/"),
        humanReadablePathSpecifier: parts.map(function (_a) {
            var name = _a.name;
            return name;
        }).join(" => "),
        isNested: parts.length > 1,
        packageNames: parts.map(function (_a) {
            var name = _a.name;
            return name;
        }),
        isDevOnly: patchFilename.endsWith(".dev.patch"),
    };
}
exports.getPackageDetailsFromPatchFilename = getPackageDetailsFromPatchFilename;
function getPatchDetailsFromCliString(specifier) {
    var parts = specifier.split("/");
    var packageNames = [];
    var scope = null;
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].startsWith("@")) {
            if (scope) {
                return null;
            }
            scope = parts[i];
        }
        else {
            if (scope) {
                packageNames.push(scope + "/" + parts[i]);
                scope = null;
            }
            else {
                packageNames.push(parts[i]);
            }
        }
    }
    var path = path_1.join("node_modules", packageNames.join("/node_modules/"));
    return {
        packageNames: packageNames,
        path: path,
        name: packageNames[packageNames.length - 1],
        humanReadablePathSpecifier: packageNames.join(" => "),
        isNested: packageNames.length > 1,
        pathSpecifier: specifier,
    };
}
exports.getPatchDetailsFromCliString = getPatchDetailsFromCliString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFja2FnZURldGFpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUGFja2FnZURldGFpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBNkI7QUFpQjdCLFNBQVMsbUJBQW1CLENBQzFCLENBQVM7SUFLVCxJQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLFFBQVEsS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNwQixLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ04sT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtTQUMxQjtRQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDQyxJQUFBLHNCQUFXLEVBQUUsd0JBQWEsQ0FBUztZQUMxQyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQy9CLE9BQU87b0JBQ0wsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLE9BQU8sRUFBRSxhQUFhO2lCQUN2QixDQUFBO2FBQ0Y7WUFDRCxPQUFPLEVBQUUsSUFBSSxFQUFLLFdBQVcsU0FBSSxhQUFlLEVBQUUsQ0FBQTtTQUNuRDtRQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDQyxJQUFBLGdCQUFLLEVBQUUsZUFBSSxFQUFFLGtCQUFPLENBQVM7WUFDcEMsT0FBTyxFQUFFLElBQUksRUFBSyxLQUFLLFNBQUksSUFBTSxFQUFFLE9BQU8sU0FBQSxFQUFFLENBQUE7U0FDN0M7S0FDRjtJQUNELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQztBQUVELFNBQWdCLGtDQUFrQyxDQUNoRCxhQUFxQjtJQUVyQixJQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUNyQyxtREFBbUQsQ0FDcEQsQ0FBQTtJQUVELElBQUksV0FBVyxFQUFFO1FBQ2YsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzNC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Q0FBRyxDQUFDLENBQUE7Z0JBQ3pDLEtBQUssR0FBRyxJQUFJLENBQUE7YUFDYjtpQkFBTTtnQkFDTCxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQzVCO1NBQ0Y7S0FDRjtJQUVELElBQU0sSUFBSSxHQUFHLFdBQUksQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7SUFFdEUsT0FBTztRQUNMLFlBQVksY0FBQTtRQUNaLElBQUksTUFBQTtRQUNKLElBQUksRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDM0MsMEJBQTBCLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckQsUUFBUSxFQUFFLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUNqQyxhQUFhLEVBQUUsU0FBUztLQUN6QixDQUFBO0FBQ0gsQ0FBQztBQW5DRCxvRUFtQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luIH0gZnJvbSBcIi4vcGF0aFwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFja2FnZURldGFpbHMge1xuICBodW1hblJlYWRhYmxlUGF0aFNwZWNpZmllcjogc3RyaW5nXG4gIHBhdGhTcGVjaWZpZXI6IHN0cmluZ1xuICBwYXRoOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIGlzTmVzdGVkOiBib29sZWFuXG4gIHBhY2thZ2VOYW1lczogc3RyaW5nW11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXRjaGVkUGFja2FnZURldGFpbHMgZXh0ZW5kcyBQYWNrYWdlRGV0YWlscyB7XG4gIHZlcnNpb246IHN0cmluZ1xuICBwYXRjaEZpbGVuYW1lOiBzdHJpbmdcbiAgaXNEZXZPbmx5OiBib29sZWFuXG59XG5cbmZ1bmN0aW9uIHBhcnNlTmFtZUFuZFZlcnNpb24oXG4gIHM6IHN0cmluZyxcbik6IHtcbiAgbmFtZTogc3RyaW5nXG4gIHZlcnNpb24/OiBzdHJpbmdcbn0gfCBudWxsIHtcbiAgY29uc3QgcGFydHMgPSBzLnNwbGl0KFwiK1wiKVxuICBzd2l0Y2ggKHBhcnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMToge1xuICAgICAgcmV0dXJuIHsgbmFtZTogcGFydHNbMF0gfVxuICAgIH1cbiAgICBjYXNlIDI6IHtcbiAgICAgIGNvbnN0IFtuYW1lT3JTY29wZSwgdmVyc2lvbk9yTmFtZV0gPSBwYXJ0c1xuICAgICAgaWYgKHZlcnNpb25Pck5hbWUubWF0Y2goL15cXGQrLykpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBuYW1lT3JTY29wZSxcbiAgICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uT3JOYW1lLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBuYW1lOiBgJHtuYW1lT3JTY29wZX0vJHt2ZXJzaW9uT3JOYW1lfWAgfVxuICAgIH1cbiAgICBjYXNlIDM6IHtcbiAgICAgIGNvbnN0IFtzY29wZSwgbmFtZSwgdmVyc2lvbl0gPSBwYXJ0c1xuICAgICAgcmV0dXJuIHsgbmFtZTogYCR7c2NvcGV9LyR7bmFtZX1gLCB2ZXJzaW9uIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhY2thZ2VEZXRhaWxzRnJvbVBhdGNoRmlsZW5hbWUoXG4gIHBhdGNoRmlsZW5hbWU6IHN0cmluZyxcbik6IFBhdGNoZWRQYWNrYWdlRGV0YWlscyB8IG51bGwge1xuICBjb25zdCBsZWdhY3lNYXRjaCA9IHBhdGNoRmlsZW5hbWUubWF0Y2goXG4gICAgL14oW14rPV0rPykoOnxcXCspKFxcZCtcXC5cXGQrXFwuXFxkKy4qKShcXC5kZXYpP1xcLnBhdGNoJC8sXG4gIClcblxuICBpZiAobGVnYWN5TWF0Y2gpIHtcbiAgICBjb25zdCBuYW1lID0gbGVnYWN5TWF0Y2hbMV1cbiAgICBjb25zdCB2ZXJzaW9uID0gbGVnYWN5TWF0Y2hbM11cblxuICAgIHJldHVybiB7XG4gICAgICBwYWNrYWdlTmFtZXM6IFtuYW1lXSxcbiAgICAgIHBhdGhTcGVjaWZpZXI6IG5hbWUsXG4gICAgICBodW1hblJlYWRhYmxlUGF0aFNwZWNpZmllcjogbmFtZSxcbiAgICAgIHBhdGg6IGpvaW4oXCJub2RlX21vZHVsZXNcIiwgbmFtZSksXG4gICAgICBuYW1lLFxuICAgICAgdmVyc2lvbixcbiAgICAgIGlzTmVzdGVkOiBmYWxzZSxcbiAgICAgIHBhdGNoRmlsZW5hbWUsXG4gICAgICBpc0Rldk9ubHk6IHBhdGNoRmlsZW5hbWUuZW5kc1dpdGgoXCIuZGV2LnBhdGNoXCIpLFxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHBhcnRzID0gcGF0Y2hGaWxlbmFtZVxuICAgIC5yZXBsYWNlKC8oXFwuZGV2KT9cXC5wYXRjaCQvLCBcIlwiKVxuICAgIC5zcGxpdChcIisrXCIpXG4gICAgLm1hcChwYXJzZU5hbWVBbmRWZXJzaW9uKVxuICAgIC5maWx0ZXIoKHgpOiB4IGlzIE5vbk51bGxhYmxlPHR5cGVvZiB4PiA9PiB4ICE9PSBudWxsKVxuXG4gIGlmIChwYXJ0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgbGFzdFBhcnQgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXVxuXG4gIGlmICghbGFzdFBhcnQudmVyc2lvbikge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6IGxhc3RQYXJ0Lm5hbWUsXG4gICAgdmVyc2lvbjogbGFzdFBhcnQudmVyc2lvbixcbiAgICBwYXRoOiBqb2luKFxuICAgICAgXCJub2RlX21vZHVsZXNcIixcbiAgICAgIHBhcnRzLm1hcCgoeyBuYW1lIH0pID0+IG5hbWUpLmpvaW4oXCIvbm9kZV9tb2R1bGVzL1wiKSxcbiAgICApLFxuICAgIHBhdGNoRmlsZW5hbWUsXG4gICAgcGF0aFNwZWNpZmllcjogcGFydHMubWFwKCh7IG5hbWUgfSkgPT4gbmFtZSkuam9pbihcIi9cIiksXG4gICAgaHVtYW5SZWFkYWJsZVBhdGhTcGVjaWZpZXI6IHBhcnRzLm1hcCgoeyBuYW1lIH0pID0+IG5hbWUpLmpvaW4oXCIgPT4gXCIpLFxuICAgIGlzTmVzdGVkOiBwYXJ0cy5sZW5ndGggPiAxLFxuICAgIHBhY2thZ2VOYW1lczogcGFydHMubWFwKCh7IG5hbWUgfSkgPT4gbmFtZSksXG4gICAgaXNEZXZPbmx5OiBwYXRjaEZpbGVuYW1lLmVuZHNXaXRoKFwiLmRldi5wYXRjaFwiKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF0Y2hEZXRhaWxzRnJvbUNsaVN0cmluZyhcbiAgc3BlY2lmaWVyOiBzdHJpbmcsXG4pOiBQYWNrYWdlRGV0YWlscyB8IG51bGwge1xuICBjb25zdCBwYXJ0cyA9IHNwZWNpZmllci5zcGxpdChcIi9cIilcblxuICBjb25zdCBwYWNrYWdlTmFtZXMgPSBbXVxuXG4gIGxldCBzY29wZTogc3RyaW5nIHwgbnVsbCA9IG51bGxcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHBhcnRzW2ldLnN0YXJ0c1dpdGgoXCJAXCIpKSB7XG4gICAgICBpZiAoc2NvcGUpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICAgIHNjb3BlID0gcGFydHNbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNjb3BlKSB7XG4gICAgICAgIHBhY2thZ2VOYW1lcy5wdXNoKGAke3Njb3BlfS8ke3BhcnRzW2ldfWApXG4gICAgICAgIHNjb3BlID0gbnVsbFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFja2FnZU5hbWVzLnB1c2gocGFydHNbaV0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcGF0aCA9IGpvaW4oXCJub2RlX21vZHVsZXNcIiwgcGFja2FnZU5hbWVzLmpvaW4oXCIvbm9kZV9tb2R1bGVzL1wiKSlcblxuICByZXR1cm4ge1xuICAgIHBhY2thZ2VOYW1lcyxcbiAgICBwYXRoLFxuICAgIG5hbWU6IHBhY2thZ2VOYW1lc1twYWNrYWdlTmFtZXMubGVuZ3RoIC0gMV0sXG4gICAgaHVtYW5SZWFkYWJsZVBhdGhTcGVjaWZpZXI6IHBhY2thZ2VOYW1lcy5qb2luKFwiID0+IFwiKSxcbiAgICBpc05lc3RlZDogcGFja2FnZU5hbWVzLmxlbmd0aCA+IDEsXG4gICAgcGF0aFNwZWNpZmllcjogc3BlY2lmaWVyLFxuICB9XG59XG4iXX0=