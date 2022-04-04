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
        this.erc721aLowCap = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aLowCap.startTokenId ? (await this.erc721aLowCap.startTokenId()).toNumber() : 0;
        offseted = (...arr) => arr.map((num) => BigNumber.from(this.startTokenId + num));
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

          this.mintOrder = [this.addr1, this.addr2, this.addr3, this.addr4, owner];

          for (const minter of this.mintOrder) {
            const balance = minter.expected.balance;
            if (balance > 0) {
              await this.erc721aLowCap['safeMint(address,uint256)'](minter.address, balance);
            }
            // sanity check
            expect(await this.erc721aLowCap.balanceOf(minter.address)).to.equal(minter.expected.balance);
          }

          if (setOwnersExplicit) {
            // sanity check
            expect((await this.erc721aLowCap.getOwnershipAt(offseted(4)[0]))[0]).to.equal(ZERO_ADDRESS);
            await this.erc721aLowCap.setOwnersExplicit(10);
            // again, sanity check
            expect((await this.erc721aLowCap.getOwnershipAt(offseted(4)[0]))[0]).to.equal(this.addr3.address);
          }
        });

        describe('tokensOfOwner', async function () {
          it('returns the correct token ids', async function () {
            for (const minter of this.mintOrder) {
              const tokens = await this.erc721aLowCap.tokensOfOwner(minter.address);
              expect(tokens).to.eql(minter.expected.tokens);
            }
          });

          it('returns the correct token ids after a transfer interferes with the normal logic', async function () {
            // Break sequential order by transfering 7th token from owner to addr4
            const tokenIdToTransfer = offseted(7);
            await this.erc721aLowCap.transferFrom(this.owner.address, this.addr4.address, tokenIdToTransfer[0]);

            // Load balances
            const ownerTokens = await this.erc721aLowCap.tokensOfOwner(this.owner.address);
            const addr4Tokens = await this.erc721aLowCap.tokensOfOwner(this.addr4.address);

            // Verify the function can still read the correct token ids
            expect(ownerTokens).to.eql(offseted(6, 8));
            expect(addr4Tokens).to.eql(tokenIdToTransfer);
          });

          it('returns correct token ids with burned tokens', async function () {
            // Burn tokens
            const tokenIdToBurn = offseted(7);
            await this.erc721aLowCap.burn(tokenIdToBurn[0]);

            // Load balances
            const ownerTokens = await this.erc721aLowCap.tokensOfOwner(this.owner.address);

            // Verify the function can still read the correct token ids
            expect(ownerTokens).to.eql(offseted(6, 8));
          });
        });
      });
    });
  };

describe('ERC721ALowCap', createTestSuite({ contract: 'ERC721ALowCapMock', constructorArgs: ['Azuki', 'AZUKI'] }));

describe(
  'ERC721ALowCap override _startTokenId()',
  createTestSuite({ contract: 'ERC721ALowCapStartTokenIdMock', constructorArgs: ['Azuki', 'AZUKI', 1] })
);

describe(
  'ERC721ALowCapOwnersExplicit',
  createTestSuite({
    contract: 'ERC721ALowCapOwnersExplicitMock',
    constructorArgs: ['Azuki', 'AZUKI'],
    setOwnersExplicit: true,
  })
);
