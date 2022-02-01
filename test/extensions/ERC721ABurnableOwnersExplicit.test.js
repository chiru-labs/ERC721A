const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

describe('ERC721ABurnableOwnersExplicit', function () {
  beforeEach(async function () {
    this.ERC721ABurnableOwnersExplicit = await ethers.getContractFactory('ERC721ABurnableOwnersExplicitMock');
    this.token = await this.ERC721ABurnableOwnersExplicit.deploy('Azuki', 'AZUKI');
    await this.token.deployed();
  });
  
  describe('zero-indexed', function () {  
    beforeEach(async function () {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      this.addr2 = addr2;
      this.addr3 = addr3;
      await this.token['safeMint(address,uint256)'](addr1.address, 1);
      await this.token['safeMint(address,uint256)'](addr2.address, 2);
      await this.token['safeMint(address,uint256)'](addr3.address, 3);
      await this.token.connect(this.addr1).burn(0);
      await this.token.connect(this.addr3).burn(4);
      await this.token.setOwnersExplicit(6);
    });

    it('ownerships correctly set', async function () {
      for (let tokenId = 0; tokenId < 6; tokenId++) {
        let owner = await this.token.getOwnershipAt(tokenId);
        expect(owner[0]).to.not.equal(ZERO_ADDRESS);
        if (tokenId == 0 || tokenId == 4) {
          expect(owner[2]).to.equal(true);
        } else {
          expect(owner[2]).to.equal(false);
        }
      }
    })
  });
  
  describe('one-indexed', function () {  
    beforeEach(async function () {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      this.addr2 = addr2;
      this.addr3 = addr3;
      await this.token.initOneIndexed();
      await this.token['safeMint(address,uint256)'](addr1.address, 1);
      await this.token['safeMint(address,uint256)'](addr2.address, 2);
      await this.token['safeMint(address,uint256)'](addr3.address, 3);
      await this.token.connect(this.addr1).burn(0+1);
      await this.token.connect(this.addr3).burn(4+1);
      await this.token.setOwnersExplicit(6);
    });

    it('ownerships correctly set', async function () {
      for (let tokenId = 0+1; tokenId < 6+1; tokenId++) {
        let owner = await this.token.getOwnershipAt(tokenId);
        expect(owner[0]).to.not.equal(ZERO_ADDRESS);
        if (tokenId == 0+1 || tokenId == 4+1) {
          expect(owner[2]).to.equal(true);
        } else {
          expect(owner[2]).to.equal(false);
        }
      }
    })
  });
});
