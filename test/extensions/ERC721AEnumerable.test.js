const { expect } = require('chai');

const RECEIVER_MAGIC_VALUE = '0x150b7a02';

describe('ERC721AEnumerable', function () {
  beforeEach(async function () {
    this.ERC721AEnumerable = await ethers.getContractFactory('ERC721AEnumerableMock');
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
    this.token = await this.ERC721AEnumerable.deploy('Azuki', 'AZUKI');
    await this.token.deployed();
  });

  context('with no minted tokens', async function () {
    it('has 0 totalSupply', async function () {
      const supply = await this.token.totalSupply();
      expect(supply).to.equal(0);
    });
  });

  context('with minted tokens', function () {
    const tokenId = 0;
    let from;
    let to;
    beforeEach(async function () {
      const [owner, addr1] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      await this.token.safeMint(addr1.address, 2);
      const sender = this.addr1;
      from = sender.address;
      this.receiver = await this.ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE);
      to = this.receiver.address;
      // await this.token.connect(sender).setApprovalForAll(to, true);
      this.transferTx = await this.token.connect(sender).transferFrom(from, to, tokenId);
    });

    it('adjusts owners tokens by index', async function () {
      console.log('to-balance:', await this.token.balanceOf(to))
      expect(await this.token.tokenOfOwnerByIndex(to, 0)).to.be.equal(tokenId);
      console.log('from-balance:', await this.token.balanceOf(from))
      expect(await this.token.tokenOfOwnerByIndex(from, 0)).to.be.not.equal(tokenId);
    });
  });
});
