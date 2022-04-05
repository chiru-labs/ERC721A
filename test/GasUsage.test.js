const { deployContract } = require('./helpers.js');

describe('ERC721A Gas Usage', function () {
  beforeEach(async function () {
    this.erc721a = await deployContract('ERC721AGasReporterMock', ['Azuki', 'AZUKI']);
    const [owner, addr1] = await ethers.getSigners();
    this.owner = owner;
    this.addr1 = addr1;
  });

  context('mintOne', function () {
    it('runs mintOne 50 times', async function () {
      for (let i = 0; i < 50; i++) {
        await this.erc721a.mintOne(this.addr1.address);
      }
    });
  });

  context('safeMintOne', function () {
    it('runs safeMintOne 50 times', async function () {
      for (let i = 0; i < 50; i++) {
        await this.erc721a.safeMintOne(this.addr1.address);
      }
    });
  });

  context('mintTen', function () {
    it('runs mintTen 50 times', async function () {
      for (let i = 0; i < 50; i++) {
        await this.erc721a.mintTen(this.addr1.address);
      }
    });
  });

  context('safeMintTen', function () {
    it('runs safeMintTen 50 times', async function () {
      for (let i = 0; i < 50; i++) {
        await this.erc721a.safeMintTen(this.addr1.address);
      }
    });
  });
});
