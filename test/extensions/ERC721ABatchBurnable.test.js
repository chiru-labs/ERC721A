const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aBatchBurnable = await deployContract(contract, constructorArgs);

        this.startTokenId = 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
      });

      beforeEach(async function () {
        const [owner, addr1, addr2, spender] = await ethers.getSigners();
        this.owner = owner;
        this.addr1 = addr1;
        this.addr2 = addr2;
        this.spender = spender;
        this.numTestTokens = 20;
        this.totalBurned = 6;
        this.burnedTokenIds1 = [2, 3, 4];
        this.burnedTokenIds2 = [7, 10, 9];
        this.notBurnedTokenId1 = 1;
        this.notBurnedTokenId2 = 5;
        this.notBurnedTokenId3 = 6;
        this.notBurnedTokenId4 = 8;
        await this.erc721aBatchBurnable['safeMint(address,uint256)'](this.addr1.address, this.numTestTokens);
        await this.erc721aBatchBurnable.connect(this.addr1).batchBurn(this.burnedTokenIds1);
        await this.erc721aBatchBurnable.connect(this.addr1).batchBurn(this.burnedTokenIds2);
      });

      context('totalSupply()', function () {
        it('has the expected value', async function () {
          expect(await this.erc721aBatchBurnable.totalSupply()).to.equal(this.numTestTokens - this.totalBurned);
        });

        it('is reduced by burns', async function () {
          const supplyBefore = await this.erc721aBatchBurnable.totalSupply();

          await this.erc721aBatchBurnable
            .connect(this.addr1)
            .batchBurn(offsetted(this.notBurnedTokenId3, this.notBurnedTokenId4));

          const supplyNow = await this.erc721aBatchBurnable.totalSupply();
          expect(supplyNow).to.equal(supplyBefore - 2);
        });
      });

      it('changes numberBurned', async function () {
        expect(await this.erc721aBatchBurnable.numberBurned(this.addr1.address)).to.equal(this.totalBurned);
        await this.erc721aBatchBurnable.connect(this.addr1).batchBurn([this.notBurnedTokenId4]);
        expect(await this.erc721aBatchBurnable.numberBurned(this.addr1.address)).to.equal(this.totalBurned + 1);
      });

      it('changes totalBurned', async function () {
        const totalBurnedBefore = (await this.erc721aBatchBurnable.totalBurned()).toNumber();

        await this.erc721aBatchBurnable
          .connect(this.addr1)
          .batchBurn(offsetted(this.notBurnedTokenId3, this.notBurnedTokenId4));

        const totalBurnedNow = (await this.erc721aBatchBurnable.totalBurned()).toNumber();
        expect(totalBurnedNow).to.equal(totalBurnedBefore + 2);
      });

      it('changes exists', async function () {
        for (let i = 0; i < 3; ++i) {
          expect(await this.erc721aBatchBurnable.exists(this.burnedTokenIds1[i])).to.be.false;
          expect(await this.erc721aBatchBurnable.exists(this.burnedTokenIds2[i])).to.be.false;
        }

        expect(await this.erc721aBatchBurnable.exists(this.notBurnedTokenId1)).to.be.true;
        expect(await this.erc721aBatchBurnable.exists(this.notBurnedTokenId2)).to.be.true;
        expect(await this.erc721aBatchBurnable.exists(this.notBurnedTokenId3)).to.be.true;
        expect(await this.erc721aBatchBurnable.exists(this.notBurnedTokenId4)).to.be.true;

        await this.erc721aBatchBurnable
          .connect(this.addr1)
          .batchBurn(offsetted(this.notBurnedTokenId3, this.notBurnedTokenId4));
        expect(await this.erc721aBatchBurnable.exists(this.notBurnedTokenId3)).to.be.false;
        expect(await this.erc721aBatchBurnable.exists(this.notBurnedTokenId4)).to.be.false;
        expect(await this.erc721aBatchBurnable.exists(this.numTestTokens)).to.be.false;
      });

      it('cannot burn a non-existing token', async function () {
        const query = this.erc721aBatchBurnable
          .connect(this.addr1)
          .batchBurn([this.notBurnedTokenId4, this.numTestTokens]);
        await expect(query).to.be.revertedWith('OwnerQueryForNonexistentToken');
      });

      it('cannot burn a burned token', async function () {
        const query = this.erc721aBatchBurnable.connect(this.addr1).batchBurn(this.burnedTokenIds1);
        await expect(query).to.be.revertedWith('OwnerQueryForNonexistentToken');
      });

      it('cannot burn with wrong caller or spender', async function () {
        const tokenIdsToBurn = [this.notBurnedTokenId1, this.notBurnedTokenId2];

        // sanity check
        await this.erc721aBatchBurnable.connect(this.addr1).approve(ZERO_ADDRESS, tokenIdsToBurn[0]);
        await this.erc721aBatchBurnable.connect(this.addr1).approve(ZERO_ADDRESS, tokenIdsToBurn[1]);
        await this.erc721aBatchBurnable.connect(this.addr1).setApprovalForAll(this.spender.address, false);

        const query = this.erc721aBatchBurnable.connect(this.spender).batchBurn(tokenIdsToBurn);
        await expect(query).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
      });

      it('spender can burn with specific approved tokenId', async function () {
        const tokenIdsToBurn = [this.notBurnedTokenId1, this.notBurnedTokenId2];

        await this.erc721aBatchBurnable.connect(this.addr1).approve(this.spender.address, tokenIdsToBurn[0]);
        await this.erc721aBatchBurnable.connect(this.addr1).approve(this.spender.address, tokenIdsToBurn[1]);
        await this.erc721aBatchBurnable.connect(this.spender).batchBurn(tokenIdsToBurn);
        expect(await this.erc721aBatchBurnable.exists(tokenIdsToBurn[0])).to.be.false;
        expect(await this.erc721aBatchBurnable.exists(tokenIdsToBurn[1])).to.be.false;
      });

      it('spender can burn with one-time approval', async function () {
        const tokenIdsToBurn = [this.notBurnedTokenId1, this.notBurnedTokenId2];

        await this.erc721aBatchBurnable.connect(this.addr1).setApprovalForAll(this.spender.address, true);
        await this.erc721aBatchBurnable.connect(this.spender).batchBurn(tokenIdsToBurn);
        expect(await this.erc721aBatchBurnable.exists(tokenIdsToBurn[0])).to.be.false;
        expect(await this.erc721aBatchBurnable.exists(tokenIdsToBurn[1])).to.be.false;
      });

      it('cannot transfer a burned token', async function () {
        const query = this.erc721aBatchBurnable
          .connect(this.addr1)
          .transferFrom(this.addr1.address, this.addr2.address, this.burnedTokenIds1[0]);
        await expect(query).to.be.revertedWith('OwnerQueryForNonexistentToken');
      });

      it('does not affect _totalMinted', async function () {
        const tokenIdsToBurn = [this.notBurnedTokenId1, this.notBurnedTokenId2];
        const totalMintedBefore = await this.erc721aBatchBurnable.totalMinted();
        expect(totalMintedBefore).to.equal(this.numTestTokens);
        await this.erc721aBatchBurnable.connect(this.addr1).batchBurn(tokenIdsToBurn);
        expect(await this.erc721aBatchBurnable.totalMinted()).to.equal(totalMintedBefore);
      });

      it('adjusts owners balances', async function () {
        expect(await this.erc721aBatchBurnable.balanceOf(this.addr1.address)).to.be.equal(
          this.numTestTokens - this.totalBurned
        );
      });

      it('startTimestamp updated correctly', async function () {
        const tokenIdsToBurn = [this.notBurnedTokenId1];
        const ownershipBefore = await this.erc721aBatchBurnable.getOwnershipAt(tokenIdsToBurn[0]);
        const timestampBefore = parseInt(ownershipBefore.startTimestamp);
        const timestampToMine = (await getBlockTimestamp()) + 12345;
        await mineBlockTimestamp(timestampToMine);
        const timestampMined = await getBlockTimestamp();
        await this.erc721aBatchBurnable.connect(this.addr1).batchBurn(tokenIdsToBurn);
        const ownershipAfter = await this.erc721aBatchBurnable.getOwnershipAt(tokenIdsToBurn[0]);
        const timestampAfter = parseInt(ownershipAfter.startTimestamp);
        expect(timestampBefore).to.be.lt(timestampToMine);
        expect(timestampAfter).to.be.gte(timestampToMine);
        expect(timestampAfter).to.be.lt(timestampToMine + 10);
        expect(timestampToMine).to.be.eq(timestampMined);
      });

      describe('ownerships correctly set', async function () {
        it('with token before previously burnt token transferred and burned', async function () {
          await this.erc721aBatchBurnable
            .connect(this.addr1)
            .transferFrom(this.addr1.address, this.addr2.address, this.notBurnedTokenId1);
          expect(await this.erc721aBatchBurnable.ownerOf(this.notBurnedTokenId1)).to.be.equal(this.addr2.address);
          await this.erc721aBatchBurnable.connect(this.addr2).batchBurn([this.notBurnedTokenId1]);
          for (let i = 0; i < this.numTestTokens; ++i) {
            if (i == this.notBurnedTokenId1 || this.burnedTokenIds1.includes(i) || this.burnedTokenIds2.includes(i)) {
              await expect(this.erc721aBatchBurnable.ownerOf(i)).to.be.revertedWith('OwnerQueryForNonexistentToken');
            } else {
              expect(await this.erc721aBatchBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with token after previously burnt token transferred and burned', async function () {
          const tokenIdsToBurn = [this.notBurnedTokenId1, this.notBurnedTokenId3];
          await this.erc721aBatchBurnable
            .connect(this.addr1)
            .transferFrom(this.addr1.address, this.addr2.address, tokenIdsToBurn[0]);
          await this.erc721aBatchBurnable
            .connect(this.addr1)
            .transferFrom(this.addr1.address, this.addr2.address, tokenIdsToBurn[1]);
          expect(await this.erc721aBatchBurnable.ownerOf(tokenIdsToBurn[0])).to.be.equal(this.addr2.address);
          expect(await this.erc721aBatchBurnable.ownerOf(tokenIdsToBurn[1])).to.be.equal(this.addr2.address);
          await this.erc721aBatchBurnable.connect(this.addr2).batchBurn(tokenIdsToBurn);
          for (let i = 0; i < this.numTestTokens; ++i) {
            if (tokenIdsToBurn.includes(i) || this.burnedTokenIds1.includes(i) || this.burnedTokenIds2.includes(i)) {
              await expect(this.erc721aBatchBurnable.ownerOf(i)).to.be.revertedWith('OwnerQueryForNonexistentToken');
            } else {
              expect(await this.erc721aBatchBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with first token burned', async function () {
          await this.erc721aBatchBurnable.connect(this.addr1).batchBurn([0]);
          for (let i = 0; i < this.numTestTokens; ++i) {
            if (i == 0 || this.burnedTokenIds1.includes(i) || this.burnedTokenIds2.includes(i)) {
              await expect(this.erc721aBatchBurnable.ownerOf(i)).to.be.revertedWith('OwnerQueryForNonexistentToken');
            } else {
              expect(await this.erc721aBatchBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with last token burned', async function () {
          await expect(this.erc721aBatchBurnable.ownerOf(offsetted(this.numTestTokens))).to.be.revertedWith(
            'OwnerQueryForNonexistentToken'
          );
          await this.erc721aBatchBurnable.connect(this.addr1).batchBurn([offsetted(this.numTestTokens - 1)]);
          await expect(this.erc721aBatchBurnable.ownerOf(offsetted(this.numTestTokens - 1))).to.be.revertedWith(
            'OwnerQueryForNonexistentToken'
          );
        });
      });
    });
  };

describe(
  'ERC721ABatchBurnable',
  createTestSuite({ contract: 'ERC721ABatchBurnableMock', constructorArgs: ['Azuki', 'AZUKI'] })
);
