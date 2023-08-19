"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cross_spawn_1 = require("cross-spawn");
var defaultOptions = {
    logStdErrOnError: true,
    throwOnError: true,
};
exports.spawnSafeSync = function (command, args, options) {
    var mergedOptions = Object.assign({}, defaultOptions, options);
    var result = cross_spawn_1.sync(command, args, options);
    if (result.error || result.status !== 0) {
        if (mergedOptions.logStdErrOnError) {
            if (result.stderr) {
                console.error(result.stderr.toString());
            }
            else if (result.error) {
                console.error(result.error);
            }
        }
        if (mergedOptions.throwOnError) {
            throw result;
        }
    }
    return result;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bhd25TYWZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NwYXduU2FmZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUErQztBQVEvQyxJQUFNLGNBQWMsR0FBcUI7SUFDdkMsZ0JBQWdCLEVBQUUsSUFBSTtJQUN0QixZQUFZLEVBQUUsSUFBSTtDQUNuQixDQUFBO0FBRVksUUFBQSxhQUFhLEdBQUcsVUFDM0IsT0FBZSxFQUNmLElBQWUsRUFDZixPQUEwQjtJQUUxQixJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDaEUsSUFBTSxNQUFNLEdBQUcsa0JBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ2hELElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN2QyxJQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRTtZQUNsQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO2FBQ3hDO2lCQUFNLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtnQkFDdkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDNUI7U0FDRjtRQUNELElBQUksYUFBYSxDQUFDLFlBQVksRUFBRTtZQUM5QixNQUFNLE1BQU0sQ0FBQTtTQUNiO0tBQ0Y7SUFDRCxPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHN5bmMgYXMgc3Bhd25TeW5jIH0gZnJvbSBcImNyb3NzLXNwYXduXCJcclxuaW1wb3J0IHsgU3Bhd25PcHRpb25zIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIlxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTcGF3blNhZmVPcHRpb25zIGV4dGVuZHMgU3Bhd25PcHRpb25zIHtcclxuICB0aHJvd09uRXJyb3I/OiBib29sZWFuXHJcbiAgbG9nU3RkRXJyT25FcnJvcj86IGJvb2xlYW5cclxufVxyXG5cclxuY29uc3QgZGVmYXVsdE9wdGlvbnM6IFNwYXduU2FmZU9wdGlvbnMgPSB7XHJcbiAgbG9nU3RkRXJyT25FcnJvcjogdHJ1ZSxcclxuICB0aHJvd09uRXJyb3I6IHRydWUsXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzcGF3blNhZmVTeW5jID0gKFxyXG4gIGNvbW1hbmQ6IHN0cmluZyxcclxuICBhcmdzPzogc3RyaW5nW10sXHJcbiAgb3B0aW9ucz86IFNwYXduU2FmZU9wdGlvbnMsXHJcbikgPT4ge1xyXG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucylcclxuICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmMoY29tbWFuZCwgYXJncywgb3B0aW9ucylcclxuICBpZiAocmVzdWx0LmVycm9yIHx8IHJlc3VsdC5zdGF0dXMgIT09IDApIHtcclxuICAgIGlmIChtZXJnZWRPcHRpb25zLmxvZ1N0ZEVyck9uRXJyb3IpIHtcclxuICAgICAgaWYgKHJlc3VsdC5zdGRlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKHJlc3VsdC5zdGRlcnIudG9TdHJpbmcoKSlcclxuICAgICAgfSBlbHNlIGlmIChyZXN1bHQuZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcilcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG1lcmdlZE9wdGlvbnMudGhyb3dPbkVycm9yKSB7XHJcbiAgICAgIHRocm93IHJlc3VsdFxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0XHJcbn1cclxuIl19