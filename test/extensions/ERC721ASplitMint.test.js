const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const EXPECTED_GAS_PER_MINT_TX = 100_000;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

        this.owner = owner;

        this.minter = addr1;

        this.ERC721ASplitMint = await deployContract(contract, constructorArgs);

        this.startTokenId = this.ERC721ASplitMint.startTokenId
          ? (await this.ERC721ASplitMint.startTokenId()).toNumber()
          : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
      });

      it('should mint', async function () {
        const tokenId = offsetted(0);
        const tx = await this.ERC721ASplitMint.connect(this.minter).mint(1);

        await expect(tx).to.emit(this.ERC721ASplitMint, 'Transfer').withArgs(ZERO_ADDRESS, this.minter.address, tokenId);

        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();

        console.log(`${contract} mint gas used: ${gasUsed} for 1 token`);

        expect(gasUsed).to.be.below(EXPECTED_GAS_PER_MINT_TX);
      });

      it('should mint 100 tokens with gas spend less than 1_000_000', async function () {
        const tx = await this.ERC721ASplitMint.connect(this.minter).mint(100);

        // mints tokens 0-99
        await expect(tx).to.emit(this.ERC721ASplitMint, 'Transfer').withArgs(ZERO_ADDRESS, this.minter.address, offsetted(0));
        await expect(tx).to.emit(this.ERC721ASplitMint, 'Transfer').withArgs(ZERO_ADDRESS, this.minter.address, offsetted(1));
        await expect(tx).to.emit(this.ERC721ASplitMint, 'Transfer').withArgs(ZERO_ADDRESS, this.minter.address, offsetted(50));
        await expect(tx).to.emit(this.ERC721ASplitMint, 'Transfer').withArgs(ZERO_ADDRESS, this.minter.address, offsetted(99));

        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();

        console.log(`${contract} mint gas used: ${gasUsed} for 100 tokens`);

        const BATCH_SIZE = 10;

        expect(receipt.gasUsed.toNumber()).to.be.lessThan(BATCH_SIZE * EXPECTED_GAS_PER_MINT_TX);
      });
    });
  };

describe('ERC721ASplitMint', createTestSuite({ contract: 'ERC721ASplitMintMock', constructorArgs: ['Azuki', 'AZUKI'] }));
