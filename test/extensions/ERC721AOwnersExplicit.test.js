const { deployContract } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aOwnersExplicit = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aOwnersExplicit.startTokenId
          ? (await this.erc721aOwnersExplicit.startTokenId()).toNumber()
          : 0;
      });

      context('with no minted tokens', async function () {
        it('does not have enough tokens minted', async function () {
          await expect(this.erc721aOwnersExplicit.setOwnersExplicit(1)).to.be.revertedWith('NoTokensMintedYet');
        });
      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2, addr3] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
          this.addr3 = addr3;
          // After the following mints, our ownership array will look like this:
          // | 1 | 2 | Empty | 3 | Empty | Empty |
          await this.erc721aOwnersExplicit['safeMint(address,uint256)'](addr1.address, 1);
          await this.erc721aOwnersExplicit['safeMint(address,uint256)'](addr2.address, 2);
          await this.erc721aOwnersExplicit['safeMint(address,uint256)'](addr3.address, 3);
        });

        describe('setOwnersExplicit', async function () {
          it('rejects 0 quantity', async function () {
            await expect(this.erc721aOwnersExplicit.setOwnersExplicit(0)).to.be.revertedWith('QuantityMustBeNonZero');
          });

          it('handles single increment properly', async function () {
            await this.erc721aOwnersExplicit.setOwnersExplicit(1);
            expect(await this.erc721aOwnersExplicit.nextOwnerToExplicitlySet()).to.equal(
              (1 + this.startTokenId).toString()
            );
          });

          it('properly sets the ownership of index 2', async function () {
            let ownerAtTwo = await this.erc721aOwnersExplicit.getOwnershipAt(2 + this.startTokenId);
            expect(ownerAtTwo[0]).to.equal(ZERO_ADDRESS);
            await this.erc721aOwnersExplicit.setOwnersExplicit(3);
            ownerAtTwo = await this.erc721aOwnersExplicit.getOwnershipAt(2);
            expect(ownerAtTwo[0]).to.equal(this.addr2.address);
            expect(await this.erc721aOwnersExplicit.nextOwnerToExplicitlySet()).to.equal(
              (3 + this.startTokenId).toString()
            );
          });

          it('sets all ownerships in one go', async function () {
            await this.erc721aOwnersExplicit.setOwnersExplicit(6);
            for (let tokenId = this.startTokenId; tokenId < 6 + this.startTokenId; tokenId++) {
              let owner = await this.erc721aOwnersExplicit.getOwnershipAt(tokenId);
              expect(owner[0]).to.not.equal(ZERO_ADDRESS);
            }
          });

          it('sets all ownerships with overflowing quantity', async function () {
            await this.erc721aOwnersExplicit.setOwnersExplicit(15);
            for (let tokenId = this.startTokenId; tokenId < 6 + this.startTokenId; tokenId++) {
              let owner = await this.erc721aOwnersExplicit.getOwnershipAt(tokenId);
              expect(owner[0]).to.not.equal(ZERO_ADDRESS);
            }
          });

          it('sets all ownerships in multiple calls', async function () {
            await this.erc721aOwnersExplicit.setOwnersExplicit(2);
            expect(await this.erc721aOwnersExplicit.nextOwnerToExplicitlySet()).to.equal(
              (2 + this.startTokenId).toString()
            );
            await this.erc721aOwnersExplicit.setOwnersExplicit(1);
            expect(await this.erc721aOwnersExplicit.nextOwnerToExplicitlySet()).to.equal(
              (3 + this.startTokenId).toString()
            );
            await this.erc721aOwnersExplicit.setOwnersExplicit(3);
            for (let tokenId = this.startTokenId; tokenId < 6 + this.startTokenId; tokenId++) {
              let owner = await this.erc721aOwnersExplicit.getOwnershipAt(tokenId);
              expect(owner[0]).to.not.equal(ZERO_ADDRESS);
            }
          });

          it('rejects after all ownerships have been set', async function () {
            await this.erc721aOwnersExplicit.setOwnersExplicit(6);
            await expect(this.erc721aOwnersExplicit.setOwnersExplicit(1)).to.be.revertedWith(
              'AllOwnershipsHaveBeenSet'
            );
          });
        });
      });
    });
  };

describe(
  'ERC721AOwnersExplicit',
  createTestSuite({
    contract: 'ERC721AOwnersExplicitMock',
    constructorArgs: ['Azuki', 'AZUKI'],
  })
);

describe(
  'ERC721AOwnersExplicit override _startTokenId()',
  createTestSuite({
    contract: 'ERC721AOwnersExplicitStartTokenIdMock',
    constructorArgs: ['Azuki', 'AZUKI', 1],
  })
);
