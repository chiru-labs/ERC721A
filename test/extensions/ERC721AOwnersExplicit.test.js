const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

describe('ERC721AOwnersExplicit', function () {
  beforeEach(async function () {
    this.ERC721AOwnersExplicit = await ethers.getContractFactory('ERC721AOwnersExplicitMock');
    this.token = await this.ERC721AOwnersExplicit.deploy('Azuki', 'AZUKI');
    await this.token.deployed();
  });

  context('with no minted tokens', async function () {
    it('does not have enough tokens minted', async function () {
      await expect(this.token.setOwnersExplicit(1)).to.be.revertedWith('NoTokensMintedYet');
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
      await this.token['safeMint(address,uint256)'](addr1.address, 1);
      await this.token['safeMint(address,uint256)'](addr2.address, 2);
      await this.token['safeMint(address,uint256)'](addr3.address, 3);
    });

    describe('setOwnersExplicit', async function () {
      it('rejects 0 quantity', async function () {
        await expect(this.token.setOwnersExplicit(0)).to.be.revertedWith('QuantityMustBeNonZero');
      });

      it('handles single increment properly', async function () {
        await this.token.setOwnersExplicit(1);
        expect(await this.token.nextOwnerToExplicitlySet()).to.equal('1');
      });

      it('properly sets the ownership of index 2', async function () {
        let ownerAtTwo = await this.token.getOwnershipAt(2);
        expect(ownerAtTwo[0]).to.equal(ZERO_ADDRESS);
        await this.token.setOwnersExplicit(3);
        ownerAtTwo = await this.token.getOwnershipAt(2);
        expect(ownerAtTwo[0]).to.equal(this.addr2.address);
        expect(await this.token.nextOwnerToExplicitlySet()).to.equal('3');
      });

      it('sets all ownerships in one go', async function () {
        await this.token.setOwnersExplicit(6);
        for (let tokenId = 0; tokenId < 6; tokenId++) {
          let owner = await this.token.getOwnershipAt(tokenId);
          expect(owner[0]).to.not.equal(ZERO_ADDRESS);
        }
      });

      it('sets all ownerships with overflowing quantity', async function () {
        await this.token.setOwnersExplicit(15);
        for (let tokenId = 0; tokenId < 6; tokenId++) {
          let owner = await this.token.getOwnershipAt(tokenId);
          expect(owner[0]).to.not.equal(ZERO_ADDRESS);
        }
      });

      it('sets all ownerships in multiple calls', async function () {
        await this.token.setOwnersExplicit(2);
        expect(await this.token.nextOwnerToExplicitlySet()).to.equal('2');
        await this.token.setOwnersExplicit(1);
        expect(await this.token.nextOwnerToExplicitlySet()).to.equal('3');
        await this.token.setOwnersExplicit(3);
        for (let tokenId = 0; tokenId < 6; tokenId++) {
          let owner = await this.token.getOwnershipAt(tokenId);
          expect(owner[0]).to.not.equal(ZERO_ADDRESS);
        }
      });

      it('rejects after all ownerships have been set', async function () {
        await this.token.setOwnersExplicit(6);
        await expect(this.token.setOwnersExplicit(1)).to.be.revertedWith('AllOwnershipsHaveBeenSet');
      });
    });
  });
});
