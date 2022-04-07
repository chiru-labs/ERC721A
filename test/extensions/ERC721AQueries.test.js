const { deployContract } = require('../helpers.js');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs, setOwnersExplicit = false }) =>
  function () {
    let offseted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aQueries = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aQueries.startTokenId ? 
          (await this.erc721aQueries.startTokenId()).toNumber() : 0;

        offseted = (...arr) => arr.map((num) => BigNumber.from(this.startTokenId + num));
      });

      const expectRawOwnershipBurned = function (rawOwnership, address) {
        expect(rawOwnership.burned).to.eql(true);
        expect(rawOwnership.addr).to.eql(address);
        expect(rawOwnership.startTimestamp).to.not.eql(BigNumber.from(0));
      };

      const expectRawOwnershipNotExists = function (rawOwnership) {
        expect(rawOwnership.burned).to.eql(false);
        expect(rawOwnership.addr).to.eql(ZERO_ADDRESS);
        expect(rawOwnership.startTimestamp).to.eql(BigNumber.from(0));
      };

      const expectRawOwnershipExists = function (rawOwnership, address) {
        expect(rawOwnership.burned).to.eql(false);
        expect(rawOwnership.addr).to.eql(address);
        expect(rawOwnership.startTimestamp).to.not.eql(BigNumber.from(0));
      };

      context('with no minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
        });

        describe('tokensOfOwner', async function () {
          it('returns empty array', async function () {
            expect(await this.erc721aQueries.tokensOfOwner(this.owner.address)).to.eql([]);
            expect(await this.erc721aQueries.tokensOfOwner(this.addr1.address)).to.eql([]);
          });
        });

        describe('tokensOfOwnerIn', async function () {
          it('returns empty array', async function () {
            expect(await this.erc721aQueries.tokensOfOwnerIn(this.owner.address, 0, 9)).to.eql([]);
            expect(await this.erc721aQueries.tokensOfOwnerIn(this.addr1.address, 0, 9)).to.eql([]);
          });
        });

        describe('rawOwnershipOf', async function () {
          it('returns empty struct', async function () {
            expectRawOwnershipNotExists(await this.erc721aQueries.rawOwnershipOf(0));
            expectRawOwnershipNotExists(await this.erc721aQueries.rawOwnershipOf(1));
          });
        });

        describe('rawOwnershipsOf', async function () {
          it('returns empty structs', async function () {
            const tokenIds = [0, 1, 2, 3];
            const rawOwnerships = await this.erc721aQueries.rawOwnershipsOf(tokenIds);
            for (let i = 0; i < rawOwnerships.length; ++i) {
              expectRawOwnershipNotExists(rawOwnerships[i]);
            }
          });
        });
      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
          this.addr3 = addr3;
          this.addr4 = addr4;

          this.addr1.expected = {
            balance: 1,
            tokens: offseted(0),
          };

          this.addr2.expected = {
            balance: 2,
            tokens: offseted(1, 2),
          };

          this.addr3.expected = {
            balance: 3,
            tokens: offseted(3, 4, 5),
          };

          this.addr4.expected = {
            balance: 0,
            tokens: [],
          };

          this.owner.expected = {
            balance: 3,
            tokens: offseted(6, 7, 8),
          };

          this.lastTokenId = offseted(8)[0];
          this.currentIndex = this.lastTokenId.add(1);

          this.mintOrder = [this.addr1, this.addr2, this.addr3, this.addr4, owner];

          for (const minter of this.mintOrder) {
            const balance = minter.expected.balance;
            if (balance > 0) {
              await this.erc721aQueries['safeMint(address,uint256)'](minter.address, balance);
            }
            // sanity check
            expect(await this.erc721aQueries.balanceOf(minter.address)).to.equal(minter.expected.balance);
          }

          if (setOwnersExplicit) {
            // sanity check
            expect((await this.erc721aQueries.getOwnershipAt(offseted(4)[0]))[0]).to.equal(ZERO_ADDRESS);
            await this.erc721aQueries.setOwnersExplicit(10);
            // again, sanity check
            expect((await this.erc721aQueries.getOwnershipAt(offseted(4)[0]))[0]).to.equal(this.addr3.address);
          }
        });

        describe('tokensOfOwner', async function () {
          it('initial', async function () {
            for (const minter of this.mintOrder) {
              const tokens = await this.erc721aQueries.tokensOfOwner(minter.address);
              expect(tokens).to.eql(minter.expected.tokens);
            }
          });

          it('after a transfer', async function () {
            // Break sequential order by transfering 7th token from owner to addr4
            const tokenIdToTransfer = offseted(7);
            await this.erc721aQueries.transferFrom(this.owner.address, this.addr4.address, tokenIdToTransfer[0]);

            // Load balances
            const ownerTokens = await this.erc721aQueries.tokensOfOwner(this.owner.address);
            const addr4Tokens = await this.erc721aQueries.tokensOfOwner(this.addr4.address);

            // Verify the function can still read the correct token ids
            expect(ownerTokens).to.eql(offseted(6, 8));
            expect(addr4Tokens).to.eql(tokenIdToTransfer);
          });

          it('after a burn', async function () {
            // Burn tokens
            const tokenIdToBurn = offseted(7);
            await this.erc721aQueries.burn(tokenIdToBurn[0]);

            // Load balances
            const ownerTokens = await this.erc721aQueries.tokensOfOwner(this.owner.address);

            // Verify the function can still read the correct token ids
            expect(ownerTokens).to.eql(offseted(6, 8));
          });
        });

        describe('tokensOfOwnerIn', async function () {
          const expectCorrect = async function (addr, start, stop) {
            const expectedTokens = (await this.erc721aQueries.tokensOfOwner(addr))
              .filter(x => BigNumber.from(start).lte(x) && BigNumber.from(stop).gt(x));
            const tokens = await this.erc721aQueries.tokensOfOwnerIn(addr, start, stop);
            expect(tokens).to.eql(expectedTokens);
          };

          const subTests = function (description, beforeEachFunction) {
            describe(description, async function () {
              it('all token ids', async function () {
                await beforeEachFunction.call(this);
                await expectCorrect.call(this, this.owner.address, this.startTokenId, this.currentIndex);
                await expectCorrect.call(this, this.owner.address, this.startTokenId, this.currentIndex.add(1));
              });

              it('partial token ids', async function () {
                await beforeEachFunction.call(this);
                const ownerTokens = this.owner.expected.tokens;
                const start = ownerTokens[0];
                const stop = ownerTokens[ownerTokens.length - 1] + 1;
                for (let o = 1; o <= ownerTokens.length; ++o) {
                  // Start truncated.
                  await expectCorrect.call(this, this.owner.address, start + o, stop);
                  // End truncated.
                  await expectCorrect.call(this, this.owner.address, start, stop - o);
                  // Start and end truncated. This also tests for start + o > stop - o.
                  await expectCorrect.call(this, this.owner.address, start + o, stop - o);
                }
                for (let o = 0, n = parseInt(this.currentIndex) + 1; o <= n; ++o) {
                  // Sliding window.
                  await expectCorrect.call(this, this.owner.address, o, o + ownerTokens.length);
                }
              });
            });
          };

          subTests('initial', async function () {});
          
          subTests('after a token tranfer', async function () {
            await this.erc721aQueries.transferFrom(this.owner.address, this.addr4.address, offseted(7)[0]);
          });

          subTests('after a token burn', async function () {
            await this.erc721aQueries.burn(offseted(7)[0]);
          });
        });

        describe('rawOwnershipOf', async function () {
          it('token exists', async function () {  
            const tokenId = this.owner.expected.tokens[0];
            const rawOwnership = await this.erc721aQueries.rawOwnershipOf(tokenId);
            expectRawOwnershipExists(rawOwnership, this.owner.address);
          });

          it('after a token burn', async function () {
            const tokenId = this.owner.expected.tokens[0];
            await this.erc721aQueries.burn(tokenId);
            const rawOwnership = await this.erc721aQueries.rawOwnershipOf(tokenId);
            expectRawOwnershipBurned(rawOwnership, this.owner.address);
          });

          it('after a token transfer', async function () {
            const tokenId = this.owner.expected.tokens[0];
            await this.erc721aQueries.transferFrom(this.owner.address, this.addr4.address, tokenId);
            const rawOwnership = await this.erc721aQueries.rawOwnershipOf(tokenId);
            expectRawOwnershipExists(rawOwnership, this.addr4.address);
          });

          it('out of bounds', async function () {
            const rawOwnership = await this.erc721aQueries.rawOwnershipOf(this.currentIndex);
            expectRawOwnershipNotExists(rawOwnership);
          });
        });

        describe('rawOwnershipsOf', async function () {
          it('tokens exist', async function () {
            const tokenIds = [].concat(this.owner.expected.tokens, this.addr3.expected.tokens);
            const rawOwnerships = await this.erc721aQueries.rawOwnershipsOf(tokenIds);
            for (let i = 0; i < tokenIds.length; ++i) {
              const tokenId = await this.erc721aQueries.ownerOf(tokenIds[i]);
              expectRawOwnershipExists(rawOwnerships[i], tokenId);
            }
          });

          it('after a token burn', async function () {
            const tokenIds = [].concat(this.owner.expected.tokens, this.addr3.expected.tokens);
            await this.erc721aQueries.burn(tokenIds[0]);
            const rawOwnerships = await this.erc721aQueries.rawOwnershipsOf(tokenIds);
            expectRawOwnershipBurned(rawOwnerships[0], this.owner.address);
            for (let i = 1; i < tokenIds.length; ++i) {
              const tokenId = await this.erc721aQueries.ownerOf(tokenIds[i]);
              expectRawOwnershipExists(rawOwnerships[i], tokenId);
            }
          });

          it('after a token transfer', async function () {
            const tokenIds = [].concat(this.owner.expected.tokens, this.addr3.expected.tokens);
            await this.erc721aQueries.transferFrom(this.owner.address, this.addr4.address, tokenIds[0]);
            const rawOwnerships = await this.erc721aQueries.rawOwnershipsOf(tokenIds);
            expectRawOwnershipExists(rawOwnerships[0], this.addr4.address);
            for (let i = 1; i < tokenIds.length; ++i) {
              const tokenId = await this.erc721aQueries.ownerOf(tokenIds[i]);
              expectRawOwnershipExists(rawOwnerships[i], tokenId);
            }
          });

          it('out of bounds', async function () {
            const tokenIds = [].concat([this.currentIndex], this.addr3.expected.tokens);
            const rawOwnerships = await this.erc721aQueries.rawOwnershipsOf(tokenIds);
            expectRawOwnershipNotExists(rawOwnerships[0]);
            for (let i = 1; i < tokenIds.length; ++i) {
              const tokenId = await this.erc721aQueries.ownerOf(tokenIds[i]);
              expectRawOwnershipExists(rawOwnerships[i], tokenId);
            }
          });
        });
      });
    });
  };

describe('ERC721AQueries', createTestSuite({ contract: 'ERC721AQueriesMock', constructorArgs: ['Azuki', 'AZUKI'] }));

describe(
  'ERC721AQueries override _startTokenId()',
  createTestSuite({ contract: 'ERC721AQueriesStartTokenIdMock', constructorArgs: ['Azuki', 'AZUKI', 1] })
);

describe(
  'ERC721AQueriesOwnersExplicit',
  createTestSuite({
    contract: 'ERC721AQueriesOwnersExplicitMock',
    constructorArgs: ['Azuki', 'AZUKI'],
    setOwnersExplicit: true,
  })
);
