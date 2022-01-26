const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');


describe('ERC721AExplicitOwnership', function () {
  beforeEach(async function () {
    this.ERC721AExplicitOwnership = await ethers.getContractFactory('ERC721AExplicitOwnershipMock');
    this.token = await this.ERC721AExplicitOwnership.deploy('Azuki', 'AZUKI', 5);
    await this.token.deployed();
  });

  context('with no minted tokens', async function () {
    it('does not have enough tokens minted', async function () {
      await expect(
        this.token.setOwnersExplicit(1)
      ).to.be.revertedWith('no tokens minted yet');
    });
  });

  context('with minted tokens', async function () {
    beforeEach(async function () {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      this.addr2 = addr2;
      this.addr3 = addr3;
      await this.token['safeMint(address,uint256)'](addr1.address, 1);
      await this.token['safeMint(address,uint256)'](addr2.address, 2);
      await this.token['safeMint(address,uint256)'](addr3.address, 3);
    });

    describe('invalid quantity', async function () {
      it('rejects 0 quantity', async function () {
        await expect(
          this.token.setOwnersExplicit(0)
        ).to.be.revertedWith('quantity must be nonzero');
      });
    });
  });
});