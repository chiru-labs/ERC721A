import { defaultConfig } from './defaultConfig';
export function inputToConfig(input) {
    const result = { ...defaultConfig };
    for (const key in input) {
        if (input[key] !== undefined) {
            if (key in defaultConfig) {
                result[key] = input[key];
            }
            else if (key !== 'name') {
                console.warn(`Warning: Config key "${key}" not supported.`);
            }
        }
    }
    validate(result);
    return result;
}
function validate(config) {
    function checkConfigProperty(property, validator) {
        if (!validator(config[property])) {
            throw new TypeError(`Invalid config. Check the value of "${property}"`);
        }
    }
    checkConfigProperty('sourceDirectory', checkSourceDirectory);
    checkConfigProperty('outputDirectory', checkOutputDirectory);
    checkConfigProperty('flattenOutputDirectory', checkFlattenOutputDirectory);
    checkConfigProperty('nodeModulesDirectory', checkNodeModulesDirectory);
    checkConfigProperty('compilerType', checkCompilerType);
    checkConfigProperty('compilerVersion', checkCompilerVersion);
    checkConfigProperty('compilerAllowedPaths', checkCompilerAllowedPaths);
    checkConfigProperty('compilerOptions', checkCompilerOptions);
    checkConfigProperty('outputHumanReadableAbi', checkOutputHumanReadableAbi);
    checkConfigProperty('outputType', checkOutputType);
}
const checkSourceDirectory = checkType('sourceDirectory', 'string');
const checkOutputDirectory = checkType('outputDirectory', 'string');
const checkFlattenOutputDirectory = checkType('flattenOutputDirectory', 'string');
const checkNodeModulesDirectory = checkType('nodeModulesDirectory', 'string');
const checkCompilerType = checkEnum('compilerType', ['native', 'dockerized-solc', 'solcjs', 'dockerized-vyper']);
const checkCompilerVersion = checkType('compilerVersion', 'string');
function checkCompilerAllowedPaths(compilerAllowedPaths) {
    if (!Array.isArray(compilerAllowedPaths)) {
        console.warn('Warning: compilerAllowedPaths must be string[], but is not an array');
        return false;
    }
    else if (compilerAllowedPaths.some(x => typeof x !== 'string')) {
        console.warn('Warning: compilerAllowedPaths must be string[], but some of the values are not strings');
        return false;
    }
    return true;
}
const checkCompilerOptions = checkType('compilerOptions', 'object');
const checkOutputHumanReadableAbi = checkType('outputHumanReadableAbi', 'boolean');
const checkOutputType = checkEnum('outputType', ['multiple', 'combined', 'all', 'minimal']);
function checkType(key, type) {
    return function (value) {
        if (typeof value !== type) { // eslint-disable-line valid-typeof
            console.warn(`Warning: "${key}" must have type of ${type}. Received: ${typeof value}.`);
            return false;
        }
        return true;
    };
}
function checkEnum(key, values) {
    return function (value) {
        if (!values.includes(value)) {
            console.warn(`Warning: ${key} must be one of: ${values.join(', ')}. Received: ${value}.`);
            return false;
        }
        return true;
    };
}
