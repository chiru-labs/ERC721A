const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aBurnable = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aBurnable.startTokenId
          ? (await this.erc721aBurnable.startTokenId()).toNumber()
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
        await this.erc721aBurnable['safeMint(address,uint256)'](this.addr1.address, this.numTestTokens);
        await this.erc721aBurnable.connect(this.addr1).burn(this.burnedTokenId);
      });

      context('totalSupply()', function () {
        it('has the expected value', async function () {
          expect(await this.erc721aBurnable.totalSupply()).to.equal(9);
        });

        it('is reduced by burns', async function () {
          const supplyBefore = await this.erc721aBurnable.totalSupply();

          for (let i = 0; i < offsetted(2); ++i) {
            await this.erc721aBurnable.connect(this.addr1).burn(offsetted(i));

            const supplyNow = await this.erc721aBurnable.totalSupply();
            expect(supplyNow).to.equal(supplyBefore - (i + 1));
          }
        });
      });

      it('changes numberBurned', async function () {
        expect(await this.erc721aBurnable.numberBurned(this.addr1.address)).to.equal(1);
        await this.erc721aBurnable.connect(this.addr1).burn(offsetted(0));
        expect(await this.erc721aBurnable.numberBurned(this.addr1.address)).to.equal(2);
      });

      it('changes totalBurned', async function () {
        const totalBurnedBefore = (await this.erc721aBurnable.totalBurned()).toNumber();
        expect(totalBurnedBefore).to.equal(1);

        for (let i = 0; i < offsetted(2); ++i) {
          await this.erc721aBurnable.connect(this.addr1).burn(offsetted(i));

          const totalBurnedNow = (await this.erc721aBurnable.totalBurned()).toNumber();
          expect(totalBurnedNow).to.equal(totalBurnedBefore + (i + 1));
        }
      });

      it('changes exists', async function () {
        expect(await this.erc721aBurnable.exists(this.burnedTokenId)).to.be.false;
        expect(await this.erc721aBurnable.exists(this.notBurnedTokenId)).to.be.true;
      });

      it('cannot burn a non-existing token', async function () {
        const query = this.erc721aBurnable.connect(this.addr1).burn(offsetted(this.numTestTokens));
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
          await this.erc721aBurnable.connect(this.addr1).burn(offsetted(i));
        }
        expect(await this.erc721aBurnable.totalMinted()).to.equal(totalMintedBefore);
      });

      it('adjusts owners balances', async function () {
        expect(await this.erc721aBurnable.balanceOf(this.addr1.address)).to.be.equal(this.numTestTokens - 1);
      });

      it('startTimestamp updated correctly', async function () {
        const tokenIdToBurn = this.burnedTokenId + 1;
        const ownershipBefore = await this.erc721aBurnable.getOwnershipAt(tokenIdToBurn);
        const timestampBefore = parseInt(ownershipBefore.startTimestamp);
        const timestampToMine = (await getBlockTimestamp()) + 12345;
        await mineBlockTimestamp(timestampToMine);
        const timestampMined = await getBlockTimestamp();
        await this.erc721aBurnable.connect(this.addr1).burn(tokenIdToBurn);
        const ownershipAfter = await this.erc721aBurnable.getOwnershipAt(tokenIdToBurn);
        const timestampAfter = parseInt(ownershipAfter.startTimestamp);
        expect(timestampBefore).to.be.lt(timestampToMine);
        expect(timestampAfter).to.be.gte(timestampToMine);
        expect(timestampAfter).to.be.lt(timestampToMine + 10);
        expect(timestampToMine).to.be.eq(timestampMined);
      });

      describe('ownerships correctly set', async function () {
        it('with token before previously burnt token transferred and burned', async function () {
          const tokenIdToBurn = this.burnedTokenId - 1;
          await this.erc721aBurnable
            .connect(this.addr1)
            .transferFrom(this.addr1.address, this.addr2.address, tokenIdToBurn);
          expect(await this.erc721aBurnable.ownerOf(tokenIdToBurn)).to.be.equal(this.addr2.address);
          await this.erc721aBurnable.connect(this.addr2).burn(tokenIdToBurn);
          for (let i = offsetted(0); i < offsetted(this.numTestTokens); ++i) {
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
          for (let i = offsetted(0); i < offsetted(this.numTestTokens); ++i) {
            if (i == tokenIdToBurn || i == this.burnedTokenId) {
              await expect(this.erc721aBurnable.ownerOf(i)).to.be.revertedWith('OwnerQueryForNonexistentToken');
            } else {
              expect(await this.erc721aBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with first token burned', async function () {
          await this.erc721aBurnable.connect(this.addr1).burn(offsetted(0));
          for (let i = offsetted(0); i < offsetted(this.numTestTokens); ++i) {
            if (i == offsetted(0).toNumber() || i == this.burnedTokenId) {
              await expect(this.erc721aBurnable.ownerOf(i)).to.be.revertedWith('OwnerQueryForNonexistentToken');
            } else {
              expect(await this.erc721aBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with last token burned', async function () {
          await expect(this.erc721aBurnable.ownerOf(offsetted(this.numTestTokens))).to.be.revertedWith(
            'OwnerQueryForNonexistentToken'
          );
          await this.erc721aBurnable.connect(this.addr1).burn(offsetted(this.numTestTokens - 1));
          await expect(this.erc721aBurnable.ownerOf(offsetted(this.numTestTokens - 1))).to.be.revertedWith(
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
