const { deployContract } = require('../helpers.js');
const { expect } = require('chai');

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aCounter = await deployContract(contract, constructorArgs);
      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;

          this.addr1.expected = {
            balance: 1,
            tokens: [0],
          };

          this.owner.expected = {
            balance: 2,
            tokens: [1, 2],
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

        describe('setExtraData', function () {
          it('can set and get the extraData directly', async function () {
            const extraData = 12345;
            await this.erc721aCounter.setExtraDataAt(0, extraData);
            const ownership = await this.erc721aCounter.getOwnershipAt(0);
            expect(ownership.extraData).to.equal(extraData);
          });

          it('setting the extraData for uninitialized slot reverts', async function () {
            const extraData = 12345;
            await expect(this.erc721aCounter.setExtraDataAt(2, extraData))
              .to.be.revertedWith('OwnershipNotInitializedForExtraData');
            await this.erc721aCounter.transferFrom(this.owner.address, this.addr1.address, 2);
            await this.erc721aCounter.setExtraDataAt(2, extraData);
            const ownership = await this.erc721aCounter.getOwnershipAt(2);
            expect(ownership.extraData).to.equal(extraData);
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
