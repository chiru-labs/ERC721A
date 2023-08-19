# OpenZeppelin Test Helpers

[![Docs](https://img.shields.io/badge/docs-%F0%9F%93%84-blue)](https://docs.openzeppelin.com/test-helpers)
[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/test-helpers.svg)](https://www.npmjs.org/package/@openzeppelin/test-helpers)
[![Build Status](https://travis-ci.com/OpenZeppelin/openzeppelin-test-helpers.svg?branch=master)](https://travis-ci.com/OpenZeppelin/openzeppelin-test-helpers)

**Assertion library for Ethereum smart contract testing.** Make sure your contracts behave as expected.

 * Check that [transactions revert](https://docs.openzeppelin.com/test-helpers/api#expect-revert) for the correct reason
 * Verify that [events](https://docs.openzeppelin.com/test-helpers/api#expect-event) were emitted with the right values
 * Track [balance changes](https://docs.openzeppelin.com/test-helpers/api#balance) elegantly
 * Handle [very large numbers](https://docs.openzeppelin.com/test-helpers/api#bn)
 * Simulate the [passing of time](https://docs.openzeppelin.com/test-helpers/api#time)

## Overview

### Installation

```bash
npm install --save-dev @openzeppelin/test-helpers
```

#### Hardhat (formerly Buidler)

Install `web3` and the `hardhat-web3` plugin.

```
npm install --save-dev @nomiclabs/hardhat-web3 web3
```

Remember to include the plugin in your configuration as explained in the [installation instructions](https://hardhat.org/plugins/nomiclabs-hardhat-web3.html#installation).

### Usage

Import `@openzeppelin/test-helpers` in your test files to access the different assertions and utilities.

```javascript
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const ERC20 = artifacts.require('ERC20');

contract('ERC20', function ([sender, receiver]) {
  beforeEach(async function () {
    // The bundled BN library is the same one web3 uses under the hood
    this.value = new BN(1);

    this.erc20 = await ERC20.new();
  });

  it('reverts when transferring tokens to the zero address', async function () {
    // Conditions that trigger a require statement can be precisely tested
    await expectRevert(
      this.erc20.transfer(constants.ZERO_ADDRESS, this.value, { from: sender }),
      'ERC20: transfer to the zero address',
    );
  });

  it('emits a Transfer event on successful transfers', async function () {
    const receipt = await this.erc20.transfer(
      receiver, this.value, { from: sender }
    );

    // Event assertions can verify that the arguments are the expected ones
    expectEvent(receipt, 'Transfer', {
      from: sender,
      to: receiver,
      value: this.value,
    });
  });

  it('updates balances on successful transfers', async function () {
    this.erc20.transfer(receiver, this.value, { from: sender });

    // BN assertions are automatically available via chai-bn (if using Chai)
    expect(await this.erc20.balanceOf(receiver))
      .to.be.bignumber.equal(this.value);
  });
});
```

## Learn More

* Head to [Configuration](https://docs.openzeppelin.com/test-helpers/configuration) for advanced settings.
* For detailed usage information, take a look at the [API Reference](https://docs.openzeppelin.com/test-helpers/api).


## License

[MIT](LICENSE)
