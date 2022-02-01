const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

describe('ERC721ABurnable', function () {
  beforeEach(async function () {
    this.ERC721ABurnable = await ethers.getContractFactory('ERC721ABurnableMock');
    this.token = await this.ERC721ABurnable.deploy('Azuki', 'AZUKI');
    await this.token.deployed();
  });
  
  describe('zero-indexed', function () {
    beforeEach(async function () {
      const [owner, addr1] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      await this.token['safeMint(address,uint256)'](this.addr1.address, 10);
      await this.token.connect(this.addr1).burn(5);
    });

    it('changes exists', async function () {
      expect(await this.token.exists(5)).to.be.false;
    })

    it('cannot burn a non-existing token', async function () {
      await expect(this.token.connect(this.addr1).burn(10)).to.be.revertedWith(
        'ERC721A: owner query for nonexistent token'
      )
    })

    it('cannot burn a token twice', async function () {
      await expect(this.token.connect(this.addr1).burn(5)).to.be.revertedWith(
        'ERC721A: owner query for nonexistent token'
      )
    })

    it('reduces totalSupply', async function () {
      const supplyBefore = await this.token.totalSupply();
      await this.token.connect(this.addr1).burn(2);
      expect(supplyBefore - (await this.token.totalSupply())).to.equal(1);
      await this.token.connect(this.addr1).burn(1);
      expect(supplyBefore - (await this.token.totalSupply())).to.equal(2);
    })

    it('adjusts owners tokens by index', async function () {
      const n = await this.token.totalSupply();
      for (let i = 0; i < 5; ++i) {
        expect(await this.token.tokenByIndex(i)).to.be.equal(i);
      }
      for (let i = 5; i < n; ++i) {
        expect(await this.token.tokenByIndex(i)).to.be.equal(i+1);
      }
      expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2)).to.be.equal(2);
      await this.token.connect(this.addr1).burn(2);
      expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2)).to.be.equal(3);
      await this.token.connect(this.addr1).burn(0);
      expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2)).to.be.equal(4);
    })

    it('adjusts owners balances', async function () {
      expect(await this.token.balanceOf(this.addr1.address)).to.be.equal(9);
    });

    it('adjusts token by index', async function () {
      const n = await this.token.totalSupply();
      for (let i = 0; i < 5; ++i) {
        expect(await this.token.tokenByIndex(i)).to.be.equal(i);
      }
      for (let i = 5; i < n; ++i) {
        expect(await this.token.tokenByIndex(i)).to.be.equal(i+1);
      }
      await expect(this.token.tokenByIndex(n)).to.be.revertedWith(
        'ERC721A: global index out of bounds'
      )
    });
  });

  describe('one-indexed', function () {
    beforeEach(async function () {
      const [owner, addr1] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      await this.token.initOneIndexed();
      await this.token['safeMint(address,uint256)'](this.addr1.address, 10);
      await this.token.connect(this.addr1).burn(5+1);
    });

    it('changes exists', async function () {
      expect(await this.token.exists(5+1)).to.be.false;
    })

    it('has correct last index', async function () {
      await this.token.connect(this.addr1).burn(10);
    })

    it('cannot burn a non-existing token', async function () {
      await expect(this.token.connect(this.addr1).burn(11)).to.be.revertedWith(
        'ERC721A: owner query for nonexistent token'
      )
    })

    it('cannot burn a token twice', async function () {
      await expect(this.token.connect(this.addr1).burn(5+1)).to.be.revertedWith(
        'ERC721A: owner query for nonexistent token'
      )
    })

    it('reduces totalSupply', async function () {
      const supplyBefore = await this.token.totalSupply();
      await this.token.connect(this.addr1).burn(2);
      expect(supplyBefore - (await this.token.totalSupply())).to.equal(1);
      await this.token.connect(this.addr1).burn(1);
      expect(supplyBefore - (await this.token.totalSupply())).to.equal(2);
    })

    it('adjusts owners tokens by index', async function () {
      const n = await this.token.totalSupply();
      for (let i = 0; i < 5; ++i) {
        expect(await this.token.tokenByIndex(i)).to.be.equal(i+1);
      }
      for (let i = 5; i < n; ++i) {
        expect(await this.token.tokenByIndex(i)).to.be.equal(i+2);
      }
      expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2)).to.be.equal(2+1);
      await this.token.connect(this.addr1).burn(2+1);
      expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2)).to.be.equal(3+1);
      await this.token.connect(this.addr1).burn(0+1);
      expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2)).to.be.equal(4+1);
    })

    it('adjusts owners balances', async function () {
      expect(await this.token.balanceOf(this.addr1.address)).to.be.equal(9);
    });

    it('adjusts token by index', async function () {
      const n = await this.token.totalSupply();
      for (let i = 0; i < 5; ++i) {
        expect(await this.token.tokenByIndex(i)).to.be.equal(i+1);
      }
      for (let i = 5; i < n; ++i) {
        expect(await this.token.tokenByIndex(i)).to.be.equal(i+2);
      }
      await expect(this.token.tokenByIndex(n)).to.be.revertedWith(
        'ERC721A: global index out of bounds'
      )
    });
  });
});
