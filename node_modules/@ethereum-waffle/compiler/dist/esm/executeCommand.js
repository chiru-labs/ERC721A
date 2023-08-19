import { exec } from 'child_process';
const MAX_BUFFER_SIZE = 4 * 1024 * 1024; // 4 MB
export async function executeCommand(command, input) {
    return new Promise((resolve, reject) => {
        var _a, _b;
        const childProcess = exec(command, { maxBuffer: MAX_BUFFER_SIZE }, (err, stdout) => err ? reject(err) : resolve(stdout));
        (_a = childProcess.stdin) === null || _a === void 0 ? void 0 : _a.write(input);
        (_b = childProcess.stdin) === null || _b === void 0 ? void 0 : _b.end();
    });
}
