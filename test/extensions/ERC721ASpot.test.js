const { deployContract } = require('../helpers.js');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

describe('ERC721ASpot', function () {

  context('constructor', function () {
    const testConstructor = async (args, expectedError) => {
      const deployment = deployContract('ERC721ASpotMock', args);
      if (expectedError) await expect(deployment).to.be.revertedWith(expectedError);  
      else await deployment;
    };
    
    it('reverts if _sequentialUpTo is not greater than _startTokenId', async function () {
      const t = async (startTokenId, sequentialUpTo, expectSuccess) => {
        await testConstructor(
          ['Azuki', 'AZUKI', startTokenId, sequentialUpTo, 0, false], 
          expectSuccess ? false : 'SequentialUpToTooSmall'
        );
      };
      await t(0, 0, true);
      await t(1, 0, false);
      await t(0, 1, true);
      await t(100, 99, false);
      await t(100, 100, true);
      await t(100, 101, true);
      await t(100, 999, true);
    });

    it('reverts if ERC2309 mint exceeds limit', async function () {
      const t = async (startTokenId, sequentialUpTo, quantity, expectSuccess) => {
        await testConstructor(
          ['Azuki', 'AZUKI', startTokenId, sequentialUpTo, quantity, true], 
          expectSuccess ? false : 'SequentialMintExceedsLimit'
        );
      };
      await t(0, 1, 1, true);
      await t(0, 1, 2, true);
      await t(0, 1, 3, false);
      await t(100, 101, 1, true);
      await t(100, 101, 2, true);
      await t(100, 101, 3, false);
      await t(100, 109, 2, true);
      await t(100, 109, 9, true);
      await t(100, 109, 10, true);
      await t(100, 109, 11, false);
    });
  });

  context('mint sequential and spot', function () {
    beforeEach(async function () {
      const [owner, addr1] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      this.startTokenId = BigNumber.from(10);
      this.sequentialUpTo = BigNumber.from(19);
      const args = ['Azuki', 'AZUKI', this.startTokenId, this.sequentialUpTo, 0, false];
      this.erc721aSpot = await deployContract('ERC721ASpotMock', args);
    });

    it('_mintSpot emits a Transfer event', async function () {
      await expect(this.erc721aSpot.safeMintSpot(this.addr1.address, 20))
        .to.emit(this.erc721aSpot, 'Transfer')
        .withArgs(ZERO_ADDRESS, this.addr1.address, 20);
    });

    it('increases _totalSpotMinted, totalSupply', async function () {
      await this.erc721aSpot.safeMint(this.addr1.address, 5);
      expect(await this.erc721aSpot.totalSpotMinted()).to.eq(0);
      expect(await this.erc721aSpot.totalSupply()).to.eq(5);

      await this.erc721aSpot.safeMintSpot(this.addr1.address, 20);
      expect(await this.erc721aSpot.totalSpotMinted()).to.eq(1);
      expect(await this.erc721aSpot.totalSupply()).to.eq(6);

      await this.erc721aSpot.safeMintSpot(this.addr1.address, 30);
      expect(await this.erc721aSpot.totalSpotMinted()).to.eq(2);
      expect(await this.erc721aSpot.totalSupply()).to.eq(7);
    });

    it('tokensOfOwnerIn', async function () {
      expect(await this.erc721aSpot.tokensOfOwnerIn(this.addr1.address, 0, 4294967295)).to.eql([]);

      await this.erc721aSpot.safeMint(this.addr1.address, 5);
      expect(await this.erc721aSpot.tokensOfOwnerIn(this.addr1.address, 0, 4294967295))
        .to.eql([10, 11, 12, 13, 14].map(BigNumber.from));
      
      await this.erc721aSpot.safeMintSpot(this.addr1.address, 21);
      expect(await this.erc721aSpot.tokensOfOwnerIn(this.addr1.address, 0, 4294967295))
        .to.eql([10, 11, 12, 13, 14, 21].map(BigNumber.from));
      
      await this.erc721aSpot.safeMintSpot(this.addr1.address, 31);
      expect(await this.erc721aSpot.tokensOfOwnerIn(this.addr1.address, 0, 4294967295))
        .to.eql([10, 11, 12, 13, 14, 21, 31].map(BigNumber.from));
      
      await this.erc721aSpot.safeMintSpot(this.addr1.address, 22);
      expect(await this.erc721aSpot.tokensOfOwnerIn(this.addr1.address, 0, 4294967295))
        .to.eql([10, 11, 12, 13, 14, 21, 22, 31].map(BigNumber.from));
      
      await this.erc721aSpot.safeMint(this.addr1.address, 5);
      expect(await this.erc721aSpot.tokensOfOwnerIn(this.addr1.address, 0, 4294967295))
        .to.eql([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 31].map(BigNumber.from));

      await this.erc721aSpot.safeMintSpot(this.addr1.address, 20);
      expect(await this.erc721aSpot.tokensOfOwnerIn(this.addr1.address, 0, 4294967295))
        .to.eql([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 31].map(BigNumber.from));

      expect(await this.erc721aSpot.tokensOfOwnerIn(this.addr1.address, 0, 32))
        .to.eql([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 31].map(BigNumber.from));

      expect(await this.erc721aSpot.tokensOfOwnerIn(this.addr1.address, 0, 31))
        .to.eql([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(BigNumber.from));
    });

    it('explicitOwnershipOf', async function () {
      let explicitOwnership = await this.erc721aSpot.explicitOwnershipOf(10);
      expect(explicitOwnership.addr).to.eq(ZERO_ADDRESS);
      expect(explicitOwnership.burned).to.eq(false);

      await this.erc721aSpot.safeMint(this.addr1.address, 1);
      explicitOwnership = await this.erc721aSpot.explicitOwnershipOf(10);
      expect(explicitOwnership.addr).to.eq(this.addr1.address);
      expect(explicitOwnership.burned).to.eq(false);

      explicitOwnership = await this.erc721aSpot.explicitOwnershipOf(11);
      expect(explicitOwnership.addr).to.eq(ZERO_ADDRESS);
      expect(explicitOwnership.burned).to.eq(false);

      explicitOwnership = await this.erc721aSpot.explicitOwnershipOf(20);
      expect(explicitOwnership.addr).to.eq(ZERO_ADDRESS);
      expect(explicitOwnership.burned).to.eq(false);

      await this.erc721aSpot.safeMintSpot(this.addr1.address, 20);
      explicitOwnership = await this.erc721aSpot.explicitOwnershipOf(20);
      expect(explicitOwnership.addr).to.eq(this.addr1.address);
      expect(explicitOwnership.burned).to.eq(false);
    });

    it('tokensOfOwner reverts', async function () {
      await expect(this.erc721aSpot.tokensOfOwner(this.addr1.address)).to.be.revertedWith(
        'NotCompatibleWithSpotMints'
      );
    });

    it('spot minting to an existing token reverts', async function () {
      await this.erc721aSpot.safeMintSpot(this.addr1.address, 20);
      await expect(this.erc721aSpot.safeMintSpot(this.addr1.address, 20)).to.be.revertedWith(
        'TokenAlreadyExists'
      );
    });

    it('reverts if sequential mint exceeds limit', async function () {
      await expect(this.erc721aSpot.safeMint(this.addr1.address, 11)).to.be.revertedWith(
        'SequentialMintExceedsLimit'
      );
      await this.erc721aSpot.safeMint(this.addr1.address, 10);
    });

    it('reverts if _mintSpot tokenId is too small', async function () {
      await expect(this.erc721aSpot.safeMintSpot(this.addr1.address, 19)).to.be.revertedWith(
        'SpotMintTokenIdTooSmall'
      );
    });

    context('with transfers', function () {
      it('reverts if token is not minted', async function () {
        await this.erc721aSpot.safeMint(this.addr1.address, 10);
        await expect(this.erc721aSpot
          .connect(this.addr1)
          .transferFrom(this.addr1.address, this.owner.address, 21)).to.be.revertedWith(
            'OwnerQueryForNonexistentToken'
          );
        await this.erc721aSpot.safeMintSpot(this.addr1.address, 21);
        await this.erc721aSpot
          .connect(this.addr1)
          .transferFrom(this.addr1.address, this.owner.address, 21);
      });

      it('edge case 1', async function () {
        await this.erc721aSpot.safeMintSpot(this.addr1.address, 20);
        await this.erc721aSpot.safeMint(this.addr1.address, 10);
        await this.erc721aSpot.connect(this.addr1).transferFrom(this.addr1.address, this.owner.address, 20);
        expect(await this.erc721aSpot.ownerOf(20)).to.eq(this.owner.address);
        expect(await this.erc721aSpot.ownerOf(19)).to.eq(this.addr1.address);
        expect(await this.erc721aSpot.ownerOf(18)).to.eq(this.addr1.address);
        await this.erc721aSpot.connect(this.addr1).transferFrom(this.addr1.address, this.owner.address, 19);
        expect(await this.erc721aSpot.ownerOf(20)).to.eq(this.owner.address);
        expect(await this.erc721aSpot.ownerOf(19)).to.eq(this.owner.address);
        expect(await this.erc721aSpot.ownerOf(18)).to.eq(this.addr1.address);
      });

      it('edge case 2', async function () {
        await this.erc721aSpot.safeMintSpot(this.addr1.address, 20);
        await this.erc721aSpot.safeMint(this.addr1.address, 10);
        await this.erc721aSpot.connect(this.addr1).transferFrom(this.addr1.address, this.owner.address, 19);
        expect(await this.erc721aSpot.ownerOf(20)).to.eq(this.addr1.address);
        expect(await this.erc721aSpot.ownerOf(19)).to.eq(this.owner.address);
        expect(await this.erc721aSpot.ownerOf(18)).to.eq(this.addr1.address);
        await this.erc721aSpot.connect(this.addr1).transferFrom(this.addr1.address, this.owner.address, 20);
        expect(await this.erc721aSpot.ownerOf(20)).to.eq(this.owner.address);
        expect(await this.erc721aSpot.ownerOf(19)).to.eq(this.owner.address);
        expect(await this.erc721aSpot.ownerOf(18)).to.eq(this.addr1.address);
      });
    });

    context('with burns', function () {
      beforeEach(async function () {
        await this.erc721aSpot.safeMint(this.addr1.address, 5);
        await this.erc721aSpot.safeMintSpot(this.addr1.address, 20);
        await this.erc721aSpot.safeMintSpot(this.addr1.address, 30);
      });

      it('sets ownership correctly', async function () {
        const t = async (tokenIds) => {
          for (let i = 0; i < 35; ++i) {
            const tx = this.erc721aSpot.getOwnershipOf(i);
            if (tokenIds.includes(i)) await tx;
            else await expect(tx).to.be.revertedWith('OwnerQueryForNonexistentToken');
          }
        };
        await t([10, 11, 12, 13, 14, 20, 30]);
        await this.erc721aSpot.connect(this.addr1).burn(20);
        await t([10, 11, 12, 13, 14, 30]);
      });

      it('reduces balanceOf, totalSupply', async function () {
        expect(await this.erc721aSpot.balanceOf(this.addr1.address)).to.eq(7);
        await this.erc721aSpot.connect(this.addr1).burn(10);
        expect(await this.erc721aSpot.balanceOf(this.addr1.address)).to.eq(6);
        expect(await this.erc721aSpot.totalSupply()).to.eq(6);
        
        await this.erc721aSpot.connect(this.addr1).burn(20);
        expect(await this.erc721aSpot.balanceOf(this.addr1.address)).to.eq(5);
        expect(await this.erc721aSpot.totalSupply()).to.eq(5);
        
        await this.erc721aSpot.connect(this.addr1).burn(30);
        expect(await this.erc721aSpot.balanceOf(this.addr1.address)).to.eq(4);
        expect(await this.erc721aSpot.totalSupply()).to.eq(4);

        await this.erc721aSpot.connect(this.addr1).burn(11);
        await this.erc721aSpot.connect(this.addr1).burn(12);
        await this.erc721aSpot.connect(this.addr1).burn(13);
        await this.erc721aSpot.connect(this.addr1).burn(14);
        expect(await this.erc721aSpot.balanceOf(this.addr1.address)).to.eq(0);
        expect(await this.erc721aSpot.totalSupply()).to.eq(0);
      });

      it('does not reduce totalMinted', async function () {
        expect(await this.erc721aSpot.balanceOf(this.addr1.address)).to.eq(7);
        await this.erc721aSpot.connect(this.addr1).burn(10);
        expect(await this.erc721aSpot.totalMinted()).to.eq(7);
        
        await this.erc721aSpot.connect(this.addr1).burn(20);
        expect(await this.erc721aSpot.totalMinted()).to.eq(7);
        
        await this.erc721aSpot.connect(this.addr1).burn(30);
        expect(await this.erc721aSpot.totalMinted()).to.eq(7);
      });

      it('increases _numberBurned, totalBurned', async function () {
        expect(await this.erc721aSpot.balanceOf(this.addr1.address)).to.eq(7);
        await this.erc721aSpot.connect(this.addr1).burn(10);
        expect(await this.erc721aSpot.numberBurned(this.addr1.address)).to.eq(1);
        expect(await this.erc721aSpot.totalBurned()).to.eq(1);
        
        await this.erc721aSpot.connect(this.addr1).burn(20);
        expect(await this.erc721aSpot.numberBurned(this.addr1.address)).to.eq(2);
        expect(await this.erc721aSpot.totalBurned()).to.eq(2);
        
        await this.erc721aSpot.connect(this.addr1).burn(30);
        expect(await this.erc721aSpot.numberBurned(this.addr1.address)).to.eq(3);
        expect(await this.erc721aSpot.totalBurned()).to.eq(3);

        await this.erc721aSpot.connect(this.addr1).burn(11);
        await this.erc721aSpot.connect(this.addr1).burn(12);
        await this.erc721aSpot.connect(this.addr1).burn(13);
        await this.erc721aSpot.connect(this.addr1).burn(14);
        expect(await this.erc721aSpot.numberBurned(this.addr1.address)).to.eq(7);
        expect(await this.erc721aSpot.totalBurned()).to.eq(7);
      });

      it('affects _exists', async function () {
        expect(await this.erc721aSpot.exists(0)).to.eq(false);
        expect(await this.erc721aSpot.exists(9)).to.eq(false);
        expect(await this.erc721aSpot.exists(10)).to.eq(true);
        
        expect(await this.erc721aSpot.exists(20)).to.eq(true);

        await this.erc721aSpot.connect(this.addr1).burn(20);
        expect(await this.erc721aSpot.exists(20)).to.eq(false);

        this.erc721aSpot.safeMintSpot(this.owner.address, 20);
        expect(await this.erc721aSpot.exists(20)).to.eq(true);
      });

      it('forwards extraData after burn and re-mint', async function () {
        await this.erc721aSpot.setExtraDataAt(20, 123);
        let explicitOwnership = await this.erc721aSpot.explicitOwnershipOf(20);
        expect(explicitOwnership.addr).to.eq(this.addr1.address);
        expect(explicitOwnership.burned).to.eq(false);
        expect(explicitOwnership.extraData).to.eq(123);

        await this.erc721aSpot.connect(this.addr1).burn(20);
        explicitOwnership = await this.erc721aSpot.explicitOwnershipOf(20);
        expect(explicitOwnership.addr).to.eq(this.addr1.address);
        expect(explicitOwnership.burned).to.eq(true);
        expect(explicitOwnership.extraData).to.eq(123);

        this.erc721aSpot.safeMintSpot(this.owner.address, 20);
        explicitOwnership = await this.erc721aSpot.explicitOwnershipOf(20);
        expect(explicitOwnership.addr).to.eq(this.owner.address);
        expect(explicitOwnership.burned).to.eq(false);
        expect(explicitOwnership.extraData).to.eq(123);
      });
    });
  });
});
