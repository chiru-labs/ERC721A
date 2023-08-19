import fs from 'fs';
import path from 'path';
export async function loadConfig(configPath) {
    if (configPath) {
        return require(path.join(process.cwd(), configPath));
    }
    else if (fs.existsSync('./waffle.json')) {
        return require(path.join(process.cwd(), './waffle.json'));
    }
    else {
        return {};
    }
}
