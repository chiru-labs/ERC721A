const { deployContract } = require('../helpers.js');
const { expect } = require('chai');

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aPausable = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aPausable.startTokenId
          ? (await this.erc721aPausable.startTokenId()).toNumber()
          : 0;
      });

      beforeEach(async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
        this.owner = owner;
        this.addr1 = addr1;
        this.addr2 = addr2;
        this.existingTokenID = 0;
        this.numTestTokens = 1;
        await this.erc721aPausable['safeMint(address,uint256)'](this.addr1.address, this.numTestTokens);
      });

      it('cannot burn a valid token id while paused', async function () {
        await this.erc721aPausable.connect(this.owner).pause()
        const query = this.erc721aPausable
          .connect(this.addr1)
          .burn(this.existingTokenID);

        await expect(query).to.be.revertedWith('ContractPaused');
        expect(await this.erc721aPausable.ownerOf(this.existingTokenID)).to.be.equal(this.addr1.address);
      });

      it('cannot transfer a valid token id while paused', async function () {
        await this.erc721aPausable.connect(this.owner).pause()
        const query = this.erc721aPausable
          .connect(this.addr1)
          .transferFrom(this.addr1.address, this.addr2.address, this.existingTokenID);

        await expect(query).to.be.revertedWith('ContractPaused');
        expect(await this.erc721aPausable.ownerOf(this.existingTokenID)).to.be.equal(this.addr1.address);
      });

      it('can transfer a valid token id while unpaused', async function () {
        await this.erc721aPausable.connect(this.owner).pause()
        await this.erc721aPausable.connect(this.owner).unpause()
        const query = this.erc721aPausable
          .connect(this.addr1)
          .transferFrom(this.addr1.address, this.addr2.address, this.existingTokenID);

        await expect(query).to.not.be.revertedWith('ContractPaused');
        expect(await this.erc721aPausable.ownerOf(this.existingTokenID)).to.be.equal(this.addr2.address);
      });

      it('can burn a valid token id while unpaused', async function () {
        await this.erc721aPausable.connect(this.owner).pause()
        await this.erc721aPausable.connect(this.owner).unpause()
        const query = this.erc721aPausable
          .connect(this.addr1)
          .burn(this.existingTokenID);

        await expect(query).to.not.be.revertedWith('ContractPaused');
        await expect(this.erc721aPausable.ownerOf(this.existingTokenID))
          .to.be.revertedWith('OwnerQueryForNonexistentToken');
      });
    });
  };

describe(
  'ERC721APausable',
  createTestSuite({ contract: 'ERC721APausableMock', constructorArgs: ['Azuki', 'AZUKI'] })
);
