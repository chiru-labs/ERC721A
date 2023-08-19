export function findImports(sources) {
    return (file) => {
        const result = sources.find((importFile) => importFile.url === file);
        if (result) {
            return { contents: result.source };
        }
        return { error: `File not found: ${file}` };
    };
}
