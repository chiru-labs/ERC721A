import { compileProject, flattenProject } from '@ethereum-waffle/compiler';
export async function runCli(args) {
    const options = args.filter((x) => x.startsWith('-'));
    const other = args.filter((x) => !x.startsWith('-'));
    const handleOptions = () => {
        for (const option of options) {
            if (option === '--help' || option === '-h') {
                console.log(USAGE);
            }
            else {
                exitWithError(`Error: Unknown option ${option}`);
            }
        }
    };
    const handleCommands = () => {
        const isTypeFlatten = args[0] === ('flatten');
        const isTypeProvided = isTypeFlatten || args[0] === 'compile';
        const configFile = isTypeProvided ? args[1] : args[0];
        if (isTypeFlatten) {
            return flattenProject(configFile);
        }
        return compileProject(configFile);
    };
    if (options.length > 0) {
        handleOptions();
    }
    else {
        if (other.length > 2) {
            exitWithError('Error: Too many arguments!');
        }
        else {
            return handleCommands();
        }
    }
}
function exitWithError(error) {
    console.error(error);
    console.log(USAGE);
    process.exit(1);
}
const USAGE = `
  Usage:

    waffle [command] [config-file] [options]


  Commands:
    compile       Compiles solidity source code. (default parameter)
    flatten       Concat solidity source code with all dependencies.

  Config file:

    Read more about the configuration file in the documentation
    https://ethereum-waffle.readthedocs.io

  Options:

    --help, -h      Display this message
`;
