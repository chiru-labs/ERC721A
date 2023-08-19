"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
exports.makeRegExp = function (reString, name, defaultValue, caseSensitive) {
    if (!reString) {
        return defaultValue;
    }
    else {
        try {
            return new RegExp(reString, caseSensitive ? "" : "i");
        }
        catch (_) {
            console.error(chalk_1.default.red.bold("***ERROR***") + "\nInvalid format for option --" + name + "\n\n  Unable to convert the string " + JSON.stringify(reString) + " to a regular expression.\n");
            process.exit(1);
            return /unreachable/;
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZVJlZ0V4cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWtlUmVnRXhwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsZ0RBQXlCO0FBRVosUUFBQSxVQUFVLEdBQUcsVUFDeEIsUUFBZ0IsRUFDaEIsSUFBWSxFQUNaLFlBQW9CLEVBQ3BCLGFBQXNCO0lBRXRCLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDYixPQUFPLFlBQVksQ0FBQTtLQUNwQjtTQUFNO1FBQ0wsSUFBSTtZQUNGLE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUN0RDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBSSxlQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsc0NBQ3RCLElBQUksMkNBRUQsSUFBSSxDQUFDLFNBQVMsQ0FDM0MsUUFBUSxDQUNULGdDQUNGLENBQUMsQ0FBQTtZQUVJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDZixPQUFPLGFBQWEsQ0FBQTtTQUNyQjtLQUNGO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gXCJjaGFsa1wiXG5cbmV4cG9ydCBjb25zdCBtYWtlUmVnRXhwID0gKFxuICByZVN0cmluZzogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIGRlZmF1bHRWYWx1ZTogUmVnRXhwLFxuICBjYXNlU2Vuc2l0aXZlOiBib29sZWFuLFxuKTogUmVnRXhwID0+IHtcbiAgaWYgKCFyZVN0cmluZykge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAocmVTdHJpbmcsIGNhc2VTZW5zaXRpdmUgPyBcIlwiIDogXCJpXCIpXG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgY29uc29sZS5lcnJvcihgJHtjaGFsay5yZWQuYm9sZChcIioqKkVSUk9SKioqXCIpfVxuSW52YWxpZCBmb3JtYXQgZm9yIG9wdGlvbiAtLSR7bmFtZX1cblxuICBVbmFibGUgdG8gY29udmVydCB0aGUgc3RyaW5nICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgcmVTdHJpbmcsXG4gICl9IHRvIGEgcmVndWxhciBleHByZXNzaW9uLlxuYClcblxuICAgICAgcHJvY2Vzcy5leGl0KDEpXG4gICAgICByZXR1cm4gL3VucmVhY2hhYmxlL1xuICAgIH1cbiAgfVxufVxuIl19