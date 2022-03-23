const { deployContract } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aBurnable = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aBurnable.startTokenId
          ? (await this.erc721aBurnable.startTokenId()).toNumber()
          : 0;
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
        await this.erc721aBurnable['safeMint(address,uint256)'](this.addr1.address, this.numTestTokens);
        await this.erc721aBurnable.connect(this.addr1).burn(this.burnedTokenId);
      });

      context('totalSupply()', function () {
        it('has the expected value', async function () {
          expect(await this.erc721aBurnable.totalSupply()).to.equal(9);
        });

        it('is reduced by burns', async function () {
          const supplyBefore = await this.erc721aBurnable.totalSupply();

          for (let i = 0; i < 2 + this.startTokenId; ++i) {
            await this.erc721aBurnable.connect(this.addr1).burn(i + this.startTokenId);

            const supplyNow = await this.erc721aBurnable.totalSupply();
            expect(supplyNow).to.equal(supplyBefore - (i + 1));
          }
        });
      });

      it('changes exists', async function () {
        expect(await this.erc721aBurnable.exists(this.burnedTokenId)).to.be.false;
        expect(await this.erc721aBurnable.exists(this.notBurnedTokenId)).to.be.true;
      });

      it('cannot burn a non-existing token', async function () {
        const query = this.erc721aBurnable.connect(this.addr1).burn(this.numTestTokens + this.startTokenId);
        await expect(query).to.be.revertedWith('OwnerQueryForNonexistentToken');
      });

      it('cannot burn a burned token', async function () {
        const query = this.erc721aBurnable.connect(this.addr1).burn(this.burnedTokenId);
        await expect(query).to.be.revertedWith('OwnerQueryForNonexistentToken');
      });

      it('cannot burn with wrong caller or spender', async function () {
        const tokenIdToBurn = this.notBurnedTokenId;
        
        // sanity check
        await this.erc721aBurnable.connect(this.addr1).approve(ZERO_ADDRESS, tokenIdToBurn);
        await this.erc721aBurnable.connect(this.addr1).setApprovalForAll(this.spender.address, false);

        const query = this.erc721aBurnable.connect(this.spender).burn(tokenIdToBurn);
        await expect(query).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
      });

      it('spender can burn with specific approved tokenId', async function () {
        const tokenIdToBurn = this.notBurnedTokenId;

        await this.erc721aBurnable.connect(this.addr1).approve(this.spender.address, tokenIdToBurn);
        await this.erc721aBurnable.connect(this.spender).burn(tokenIdToBurn);
        expect(await this.erc721aBurnable.exists(tokenIdToBurn)).to.be.false;
      });

      it('spender can burn with one-time approval', async function () {
        const tokenIdToBurn = this.notBurnedTokenId;

        await this.erc721aBurnable.connect(this.addr1).setApprovalForAll(this.spender.address, true);
        await this.erc721aBurnable.connect(this.spender).burn(tokenIdToBurn);
        expect(await this.erc721aBurnable.exists(tokenIdToBurn)).to.be.false;
      });

      it('cannot transfer a burned token', async function () {
        const query = this.erc721aBurnable
          .connect(this.addr1)
          .transferFrom(this.addr1.address, this.addr2.address, this.burnedTokenId);
        await expect(query).to.be.revertedWith('OwnerQueryForNonexistentToken');
      });

      it('does not affect _totalMinted', async function () {
        const totalMintedBefore = await this.erc721aBurnable.totalMinted();
        expect(totalMintedBefore).to.equal(this.numTestTokens);
        for (let i = 0; i < 2; ++i) {
          await this.erc721aBurnable.connect(this.addr1).burn(i + this.startTokenId);
        }
        expect(await this.erc721aBurnable.totalMinted()).to.equal(totalMintedBefore);
      });

      it('adjusts owners balances', async function () {
        expect(await this.erc721aBurnable.balanceOf(this.addr1.address)).to.be.equal(this.numTestTokens - 1);
      });

      describe('ownerships correctly set', async function () {
        it('with token before previously burnt token transferred and burned', async function () {
          const tokenIdToBurn = this.burnedTokenId - 1;
          await this.erc721aBurnable
            .connect(this.addr1)
            .transferFrom(this.addr1.address, this.addr2.address, tokenIdToBurn);
          expect(await this.erc721aBurnable.ownerOf(tokenIdToBurn)).to.be.equal(this.addr2.address);
          await this.erc721aBurnable.connect(this.addr2).burn(tokenIdToBurn);
          for (let i = this.startTokenId; i < this.numTestTokens + this.startTokenId; ++i) {
            if (i == tokenIdToBurn || i == this.burnedTokenId) {
              await expect(this.erc721aBurnable.ownerOf(i)).to.be.revertedWith('OwnerQueryForNonexistentToken');
            } else {
              expect(await this.erc721aBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with token after previously burnt token transferred and burned', async function () {
          const tokenIdToBurn = this.burnedTokenId + 1;
          await this.erc721aBurnable
            .connect(this.addr1)
            .transferFrom(this.addr1.address, this.addr2.address, tokenIdToBurn);
          expect(await this.erc721aBurnable.ownerOf(tokenIdToBurn)).to.be.equal(this.addr2.address);
          await this.erc721aBurnable.connect(this.addr2).burn(tokenIdToBurn);
          for (let i = this.startTokenId; i < this.numTestTokens + this.startTokenId; ++i) {
            if (i == tokenIdToBurn || i == this.burnedTokenId) {
              await expect(this.erc721aBurnable.ownerOf(i)).to.be.revertedWith('OwnerQueryForNonexistentToken');
            } else {
              expect(await this.erc721aBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with first token burned', async function () {
          await this.erc721aBurnable.connect(this.addr1).burn(this.startTokenId);
          for (let i = this.startTokenId; i < this.numTestTokens + this.startTokenId; ++i) {
            if (i == this.startTokenId || i == this.burnedTokenId) {
              await expect(this.erc721aBurnable.ownerOf(i)).to.be.revertedWith('OwnerQueryForNonexistentToken');
            } else {
              expect(await this.erc721aBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with last token burned', async function () {
          await expect(this.erc721aBurnable.ownerOf(this.numTestTokens + this.startTokenId)).to.be.revertedWith(
            'OwnerQueryForNonexistentToken'
          );
          await this.erc721aBurnable.connect(this.addr1).burn(this.numTestTokens - 1 + this.startTokenId);
          await expect(this.erc721aBurnable.ownerOf(this.numTestTokens - 1 + this.startTokenId)).to.be.revertedWith(
            'OwnerQueryForNonexistentToken'
          );
        });
      });
    });
  };

describe('ERC721ABurnable', createTestSuite({ contract: 'ERC721ABurnableMock', constructorArgs: ['Azuki', 'AZUKI'] }));

describe(
  'ERC721ABurnable override _startTokenId()',
  createTestSuite({ contract: 'ERC721ABurnableStartTokenIdMock', constructorArgs: ['Azuki', 'AZUKI', 1] })
);
