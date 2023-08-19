const { web3 } = require('./setup');
const { expect } = require('chai');

const colors = require('ansi-colors');
const semver = require('semver');

const checkedProviders = new WeakSet();

async function expectException (promise, expectedError) {
  try {
    await promise;
  } catch (error) {
    if (error.message.indexOf(expectedError) === -1) {
      // When the exception was a revert, the resulting string will include only
      // the revert reason, otherwise it will be the type of exception (e.g. 'invalid opcode')
      const actualError = error.message.replace(
        /Returned error: VM Exception while processing transaction: (revert )?/,
        '',
      );
      expect(actualError).to.equal(expectedError, 'Wrong kind of exception received');
    }
    return;
  }

  expect.fail('Expected an exception but none was received');
}

async function checkRevertReasonSupport (provider) {
  if (!checkedProviders.has(provider)) {
    // Find out if the provider supports revert reasons.
    // Implementations with known support:
    //  * ganache-core (TestRPC) >=2.2.0 (https://github.com/trufflesuite/ganache-core/releases/tag/v2.2.0)

    const nodeInfo = await web3.eth.getNodeInfo();
    const ganacheVersion = /TestRPC\/v([\w.-]+)\/ethereum-js/.exec(nodeInfo);
    const hardhatVersion = /HardhatNetwork\/([\w.-]+)\/(ethereumjs-vm|@ethereumjs\/vm)/.exec(nodeInfo);

    const warn = function (msg) {
      console.log(`\
${colors.white.bgBlack('@openzeppelin/test-helpers')} ${colors.black.bgYellow('WARN')} expectRevert: ${msg}`
      );
    };

    if (ganacheVersion === null && hardhatVersion === null) {
      warn(`\
Assertions may yield false negatives!

Revert reason checks are only known to work on Ganache >=2.2.0 and Hardhat, and the current node is ${nodeInfo}.

If your node does support revert reasons, please let us know: \
https://github.com/OpenZeppelin/openzeppelin-test-helpers/issues/new`
      );
    } else if (ganacheVersion !== null && !semver.gte(ganacheVersion[1], '2.2.0')) {
      throw new Error(`\
The current version of Ganache (v${ganacheVersion[1]}) doesn't return revert reasons.

Upgrade to v2.2.0 or newer, or use expectRevert.unspecified to skip the revert reason check.`
      );
    }

    checkedProviders.add(provider);
  }
}

const expectRevert = async function (promise, expectedError) {
  promise.catch(() => { }); // Avoids uncaught promise rejections in case an input validation causes us to return early

  if (!expectedError) {
    throw Error('No revert reason specified: call expectRevert with the reason string, or use expectRevert.unspecified \
if your \'require\' statement doesn\'t have one.');
  }

  await checkRevertReasonSupport(web3.currentProvider);

  await expectException(promise, expectedError);
};

expectRevert.assertion = (promise) => expectException(promise, 'invalid opcode');
expectRevert.outOfGas = (promise) => expectException(promise, 'out of gas');
expectRevert.unspecified = (promise) => expectException(promise, 'revert');

module.exports = expectRevert;
