const { soliditySha3 } = require('web3-utils');

function ERC165 (functionSignatures = []) {
  const INTERFACE_ID_LENGTH = 4;

  const interfaceIdBuffer = functionSignatures
    .map(signature => soliditySha3(signature)) // keccak256
    .map(h =>
      Buffer
        .from(h.substring(2), 'hex')
        .slice(0, 4) // bytes4()
    )
    .reduce((memo, bytes) => {
      for (let i = 0; i < INTERFACE_ID_LENGTH; i++) {
        memo[i] = memo[i] ^ bytes[i]; // xor
      }
      return memo;
    }, Buffer.alloc(INTERFACE_ID_LENGTH));

  return `0x${interfaceIdBuffer.toString('hex')}`;
}

function ERC1820 (interfaceName) {
  return soliditySha3(interfaceName); // keccak256
}

module.exports = {
  ERC165,
  ERC1820,
};
