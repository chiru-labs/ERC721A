const solc = require("solc");

function compileContract(filename, content) {
  const input = {
    language: "Solidity",
    sources: {
      [filename]: {
        content,
      },
    },
    settings: {
      metadata: { bytecodeHash: "none" },
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  // We throw if the contract doesn't compile.
  if (output.errors && output.errors.length > 0) {
    throw output.errors[0].formattedMessage;
  }

  const compiledContracts = output.contracts[filename];
  const bytecodes = {};
  Object.keys(compiledContracts).forEach((contractName) => {
    bytecodes[contractName] =
      compiledContracts[contractName].evm.bytecode.object;
  });
  return bytecodes;
}

module.exports = compileContract;
