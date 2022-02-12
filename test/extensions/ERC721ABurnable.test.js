const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

describe('ERC721ABurnable', function () {
  
  beforeEach(async function () {
    this.ERC721ABurnable = await ethers.getContractFactory('ERC721ABurnableMock');
    this.token = await this.ERC721ABurnable.deploy('Azuki', 'AZUKI');
    await this.token.deployed();
  });
    
  beforeEach(async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    this.owner = owner;
    this.addr1 = addr1;
    this.addr2 = addr2;
    this.numTestTokens = 10;
    this.burnedTokenId = 5;
    await this.token['safeMint(address,uint256)'](this.addr1.address, this.numTestTokens);
    await this.token.connect(this.addr1).burn(this.burnedTokenId);
  });

  it('changes exists', async function () {
    expect(await this.token.exists(this.burnedTokenId)).to.be.false;
  });

  it('cannot burn a non-existing token', async function () {
    const query = this.token.connect(this.addr1).burn(this.numTestTokens);
    await expect(query).to.be.revertedWith(
      'OwnerQueryForNonexistentToken'
    );
  });

  it('cannot burn a burned token', async function () {
    const query = this.token.connect(this.addr1).burn(this.burnedTokenId);
    await expect(query).to.be.revertedWith(
      'OwnerQueryForNonexistentToken'
    );
  })

  it('cannot transfer a burned token', async function () {
    const query = this.token.connect(this.addr1)
      .transferFrom(this.addr1.address, this.addr2.address, this.burnedTokenId);
    await expect(query).to.be.revertedWith(
      'OwnerQueryForNonexistentToken'
    );
  })

  it('reduces totalSupply', async function () {
    const supplyBefore = await this.token.totalSupply();
    for (let i = 0; i < 2; ++i) {
      await this.token.connect(this.addr1).burn(i);
      expect(supplyBefore - (await this.token.totalSupply())).to.equal(i + 1);  
    }
  })

  it('adjusts owners tokens by index', async function () {
    const n = await this.token.totalSupply();
    for (let i = 0; i < this.burnedTokenId; ++i) {
      expect(await this.token.tokenByIndex(i)).to.be.equal(i);
    }
    for (let i = this.burnedTokenId; i < n; ++i) {
      expect(await this.token.tokenByIndex(i)).to.be.equal(i + 1);
    }
    // tokenIds of addr1: [0,1,2,3,4,6,7,8,9]
    expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2))
      .to.be.equal(2);
    await this.token.connect(this.addr1).burn(2);
    // tokenIds of addr1: [0,1,3,4,6,7,8,9]
    expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2))
      .to.be.equal(3);
    await this.token.connect(this.addr1).burn(0);
    // tokenIds of addr1: [1,3,4,6,7,8,9]
    expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2))
      .to.be.equal(4);
    await this.token.connect(this.addr1).burn(3);
    // tokenIds of addr1: [1,4,6,7,8,9]
    expect(await this.token.tokenOfOwnerByIndex(this.addr1.address, 2))
      .to.be.equal(6);
  })

  it('adjusts owners balances', async function () {
    expect(await this.token.balanceOf(this.addr1.address))
      .to.be.equal(this.numTestTokens - 1);
  });

  it('adjusts token by index', async function () {
    const n = await this.token.totalSupply();
    for (let i = 0; i < this.burnedTokenId; ++i) {
      expect(await this.token.tokenByIndex(i)).to.be.equal(i);
    }
    for (let i = this.burnedTokenId; i < n; ++i) {
      expect(await this.token.tokenByIndex(i)).to.be.equal(i + 1);
    }
    await expect(this.token.tokenByIndex(n)).to.be.revertedWith(
      'TokenIndexOutOfBounds'
    );
  });

  describe('ownerships correctly set', async function () {
    it('with token before previously burnt token transfered and burned', async function () {
      const tokenIdToBurn = this.burnedTokenId - 1;
      await this.token.connect(this.addr1)
        .transferFrom(this.addr1.address, this.addr2.address, tokenIdToBurn);
      expect(await this.token.ownerOf(tokenIdToBurn)).to.be.equal(this.addr2.address);  
      await this.token.connect(this.addr2).burn(tokenIdToBurn);
      for (let i = 0; i < this.numTestTokens; ++i) {
        if (i == tokenIdToBurn || i == this.burnedTokenId) {
          await expect(this.token.ownerOf(i)).to.be.revertedWith(
            'OwnerQueryForNonexistentToken'
          );
        } else {
          expect(await this.token.ownerOf(i)).to.be.equal(this.addr1.address);  
        }
      }
    });

    it('with token after previously burnt token transfered and burned', async function () {
      const tokenIdToBurn = this.burnedTokenId + 1;
      await this.token.connect(this.addr1)
        .transferFrom(this.addr1.address, this.addr2.address, tokenIdToBurn);
      expect(await this.token.ownerOf(tokenIdToBurn)).to.be.equal(this.addr2.address);
      await this.token.connect(this.addr2).burn(tokenIdToBurn);
      for (let i = 0; i < this.numTestTokens; ++i) {
        if (i == tokenIdToBurn || i == this.burnedTokenId) {
          await expect(this.token.ownerOf(i)).to.be.revertedWith(
            'OwnerQueryForNonexistentToken'
          )
        } else {
          expect(await this.token.ownerOf(i)).to.be.equal(this.addr1.address);  
        }
      }
    });

    it('with first token burned', async function () {
      await this.token.connect(this.addr1).burn(0);
      for (let i = 0; i < this.numTestTokens; ++i) {
        if (i == 0 || i == this.burnedTokenId) {
          await expect(this.token.ownerOf(i)).to.be.revertedWith(
            'OwnerQueryForNonexistentToken'
          )
        } else {
          expect(await this.token.ownerOf(i)).to.be.equal(this.addr1.address);  
        }
      }
    });

    it('with last token burned', async function () {
      await expect(this.token.ownerOf(this.numTestTokens)).to.be.revertedWith(
        'OwnerQueryForNonexistentToken'
      )
      await this.token.connect(this.addr1).burn(this.numTestTokens - 1);
      await expect(this.token.ownerOf(this.numTestTokens - 1)).to.be.revertedWith(
        'OwnerQueryForNonexistentToken'
      )
    });
  });
});
