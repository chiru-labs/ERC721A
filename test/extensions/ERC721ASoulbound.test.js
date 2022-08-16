const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aSoulbound = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aSoulbound.startTokenId
          ? (await this.erc721aSoulbound.startTokenId()).toNumber()
          : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
      });

      beforeEach(async function () {
        const [owner, addr1, addr2, spender] = await ethers.getSigners();
        this.owner = owner;
        this.addr1 = addr1;
        this.addr2 = addr2;
        this.spender = spender;
        this.numTestTokens = 10;
        this.burnedTokenId = 5;
        this.notBurnedTokenId = 6;
        await this.erc721aSoulbound['safeMint(address,uint256)'](this.addr1.address, this.numTestTokens);
        await this.erc721aSoulbound.connect(this.addr1).burn(this.burnedTokenId);
      });

      it('cannot transfer token', async function () {
        await expect(
          this.erc721aSoulbound.connect(this.addr1).transferFrom(this.addr1.address, this.addr2.address, 6)
        ).to.be.revertedWith('SoulboundTokenCannotBeTransferred');
      });
    });
  };

describe(
  'ERC721ASoulbound',
  createTestSuite({ contract: 'ERC721ASoulboundMock', constructorArgs: ['Azuki', 'AZUKI'] })
);
