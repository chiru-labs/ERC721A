import fs from 'fs';
import path from 'path';
import { isDirectory } from './utils';
export function findInputs(sourcePath, extension) {
    const stack = [sourcePath];
    const inputFiles = [];
    while (stack.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const dir = stack.pop();
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (isDirectory(filePath)) {
                stack.push(filePath);
            }
            else if (file.endsWith(extension)) {
                inputFiles.push(filePath);
            }
        }
    }
    return inputFiles;
}
