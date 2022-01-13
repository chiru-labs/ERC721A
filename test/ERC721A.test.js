const { expect } = require('chai');

describe('ERC721A', function () {
  before(async function () {
    this.ERC721A = await ethers.getContractFactory('ERC721A');
  });

  beforeEach(async function () {
    this.erc721a = await this.ERC721A.deploy("Azuki", "AZUKI", 5);
    await this.erc721a.deployed();
  });

  it('retrieves totalSupply', async function () {
    let supply = await this.erc721a.totalSupply();
    expect(supply).to.equal(0);
  });
});