const { deployContract, offsettedIndex } = require('../helpers.js');
const { expect } = require('chai');

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aCounter = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aCounter.startTokenId
          ? (await this.erc721aCounter.startTokenId()).toNumber()
          : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;

          this.addr1.expected = {
            balance: 1,
            tokens: [offsetted(0)],
          };

          this.owner.expected = {
            balance: 2,
            tokens: offsetted(1, 2),
          };

          this.mintOrder = [this.addr1, this.owner];

          for (const minter of this.mintOrder) {
            const balance = minter.expected.balance;
            if (balance > 0) {
              await this.erc721aCounter['safeMint(address,uint256)'](minter.address, balance);
            }
            // sanity check
            expect(await this.erc721aCounter.balanceOf(minter.address)).to.equal(minter.expected.balance);
          }
        });

        describe('_ownershipOf', function () {
          it('initial', async function () {
            for (const minter of this.mintOrder) {
              for (const tokenId in minter.expected.tokens) {
                const ownership = await this.erc721aCounter.getOwnershipOf(tokenId);
                expect(ownership.extraData).to.equal(42);
              }
            }
          });

          it('after a transfer', async function () {
            await this.erc721aCounter.transferFrom(this.owner.address, this.addr1.address, 1);

            const tests = [
              { tokenId: 0, expectedData: 42 },
              { tokenId: 1, expectedData: 43 },
              { tokenId: 2, expectedData: 42 },
            ];

            for (const test of tests) {
              const ownership = await this.erc721aCounter.getOwnershipOf(test.tokenId);
              expect(ownership.extraData).to.equal(test.expectedData);
            }
          });

          it('after a burn', async function () {
            await this.erc721aCounter['burn(uint256)'](2);

            const tests = [
              { tokenId: 0, expectedData: 42 },
              { tokenId: 1, expectedData: 42 },
              { tokenId: 2, expectedData: 1337 },
            ];

            for (const test of tests) {
              const ownership = await this.erc721aCounter.getOwnershipAt(test.tokenId);
              expect(ownership.extraData).to.equal(test.expectedData);
            }
          });
        });
      });
    });
  };

describe(
  'ERC721A override _extraData()',
  createTestSuite({
    contract: 'ERC721ATransferCounterMock',
    constructorArgs: ['Azuki', 'AZUKI'],
  })
);
