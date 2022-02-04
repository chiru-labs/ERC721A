describe('ERC721A Gas Usage', function () {
  beforeEach(async function () {
    this.ERC721A = await ethers.getContractFactory('ERC721AGasReporterMock');
    this.erc721a = await this.ERC721A.deploy('Azuki', 'AZUKI');
    await this.erc721a.deployed();
    const [owner, addr1] = await ethers.getSigners();
    this.owner = owner;
    this.addr1 = addr1;
  });

  context('mintOne', function () {
    it('runs mintOne 50 times', async function () {
      for (let i = 0; i < 50; i++) {
        await this.erc721a.safeMintOne(this.addr1.address);
      }
    });
  });

  context('safeMintOne', function () {
    it('runs safeMintOne 50 times', async function () {
      for (let i = 0; i < 50; i++) {
        await this.erc721a.mintOne(this.addr1.address);
      }
    });
  });

  context('mintTen', function () {
    it('runs mintTen 50 times', async function () {
      for (let i = 0; i < 50; i++) {
        await this.erc721a.safeMintTen(this.addr1.address);
      }
    });
  });

  context('safeMintTen', function () {
    it('runs mintTen 50 times', async function () {
      for (let i = 0; i < 50; i++) {
        await this.erc721a.mintTen(this.addr1.address);
      }
    });
  });
});
