const { deployContract } = require('./helpers.js');

describe('ERC721A Gas Usage', function () {
  beforeEach(async function () {
    this.erc721a = await deployContract('ERC721AGasReporterMock', ['Azuki', 'AZUKI']);
    const [owner, addr1] = await ethers.getSigners();
    this.owner = owner;
    this.addr1 = addr1;
  });

  context('mintOne', function () {
    it('runs mintOne 2 times', async function () {
      for (let i = 0; i < 2; i++) {
        await this.erc721a.mintOne(this.addr1.address);
      }
    });
  });

  context('safeMintOne', function () {
    it('runs safeMintOne 2 times', async function () {
      for (let i = 0; i < 2; i++) {
        await this.erc721a.safeMintOne(this.addr1.address);
      }
    });
  });

  context('mintTen', function () {
    it('runs mintTen 2 times', async function () {
      for (let i = 0; i < 2; i++) {
        await this.erc721a.mintTen(this.addr1.address);
      }
    });
  });

  context('safeMintTen', function () {
    it('runs safeMintTen 2 times', async function () {
      for (let i = 0; i < 2; i++) {
        await this.erc721a.safeMintTen(this.addr1.address);
      }
    });
  });

  context('transferFrom', function () {
    beforeEach(async function () {
      await this.erc721a.mintTen(this.owner.address);
      await this.erc721a.mintOne(this.owner.address);

      await this.erc721a.mintTen(this.addr1.address);
      await this.erc721a.mintOne(this.addr1.address);
    });

    it('transfer to and from two addresses', async function () {
      for (let i = 0; i < 2; ++i) {
        await this.erc721a.connect(this.owner).transferFrom(this.owner.address, this.addr1.address, 1);
        await this.erc721a.connect(this.addr1).transferFrom(this.addr1.address, this.owner.address, 1);
      }
    });

    it('transferTen ascending order', async function () {
      await this.erc721a.connect(this.owner).transferTenAsc(this.addr1.address);
    });

    it('transferTen descending order', async function () {
      await this.erc721a.connect(this.owner).transferTenDesc(this.addr1.address);
    });

    it('transferTen average order', async function () {
      await this.erc721a.connect(this.owner).transferTenAvg(this.addr1.address);
    });
  });

  it('mintOneERC2309', async function () {
    // The following call `_mintERC3201` outside of contract creation.
    // This is non-compliant with the ERC721 standard, 
    // and is only meant for gas comparisons.
    let args = ['Azuki', 'AZUKI', this.owner.address, 0, false];
    let contract = await deployContract('ERC721AWithERC2309Mock', args);
    await contract.mintOneERC2309(this.owner.address);
    await contract.mintOneERC2309(this.owner.address);
    await contract.mintOneERC2309(this.addr1.address); 
  });

  it('mintTenERC2309', async function () {
    // The following call `_mintERC3201` outside of contract creation.
    // This is non-compliant with the ERC721 standard, 
    // and is only meant for gas comparisons.
    let args = ['Azuki', 'AZUKI', this.owner.address, 0, false];
    let contract = await deployContract('ERC721AWithERC2309Mock', args);
    await contract.mintTenERC2309(this.owner.address);
    await contract.mintTenERC2309(this.owner.address);
    await contract.mintTenERC2309(this.addr1.address);  
  });
});
