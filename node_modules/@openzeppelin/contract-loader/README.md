# OpenZeppelin Contract Loader

[![Docs](https://img.shields.io/badge/docs-%F0%9F%93%84-blue)](https://docs.openzeppelin.com/contract-loader)
[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/contract-loader.svg)](https://www.npmjs.org/package/@openzeppelin/contract-loader)
[![Build Status](https://circleci.com/gh/OpenZeppelin/openzeppelin-contract-loader.svg?style=shield)](https://circleci.com/gh/OpenZeppelin/openzeppelin-contract-loader)

**Load contract objects from built artifacts or ABIs.** Includes support for both `web3-eth-contract` and `@truffle/contract` objects.

```javascript
const { setupLoader } = require('@openzeppelin/contract-loader');
const loader = setupLoader({ provider: new Web3('http://localhost:8545') }).web3;

const address = '0xCfEB869F69431e42cdB54A4F4f105C19C080A601';
const erc20 = loader.fromArtifact('ERC20', address);

const totalSupply = await token.methods.totalSupply().call();
```

## Overview

### Installation

```bash
npm install @openzeppelin/contract-loader
```

You may also need to install [`web3-eth-contract`](https://www.npmjs.com/package/web3-eth-contract) or [`@truffle/contract`](https://www.npmjs.com/package/@truffle/contract), depending on which abstractions you want to be able to load.

>Contract Loader requires access to the filesystem to read contract ABIs. Because of this, it will not work in a browser-based Dapp.

### Usage

Create a loader object:

```javascript
const { setupLoader } = require('@openzeppelin/contract-loader');

const loader = setupLoader({
  provider,      // either a web3 provider or a web3 instance
  defaultSender, // optional
  defaultGas,    // optional, defaults to 8 million
});
```

Load web3 contracts:

```javascript
const ERC20 = loader.web3.fromArtifact('ERC20');

// Deploy contract
const token = await ERC20.deploy().send();

// Send transactions and query state
const balance = await token.methods.balanceOf(sender).call();
await token.methods.transfer(receiver, balance).send({ from: sender });

```

Load Truffle contracts:

```javascript
const ERC20 = loader.truffle.fromArtifact('ERC20');

// Deploy contract
const token = await ERC20.new();

// Send transactions and query state
const balance = await token.balanceOf(sender);
await token.transfer(receiver, balance, { from: sender });
```

## Learn More

* For detailed usage information, take a look at the [API Reference](https://docs.openzeppelin.com/contract-loader/api).

## License

[MIT](LICENSE).
