export function extractStringConstraints(options) {
    return options[0] !== undefined
        ? typeof options[0] === 'number'
            ? typeof options[1] === 'number'
                ? { minLength: options[0], maxLength: options[1] }
                : { maxLength: options[0] }
            : options[0]
        : {};
}
