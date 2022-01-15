const { expect } = require('chai');
const { constants, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;


describe('ERC721A', function () {
  before(async function () {
    this.ERC721A = await ethers.getContractFactory('ERC721AMock');
  });

  beforeEach(async function () {
    this.erc721a = await this.ERC721A.deploy("Azuki", "AZUKI", 5);
    await this.erc721a.deployed();
  });

  context('with no minted tokens', async function () {
    it('has 0 totalSupply', async function () {
      const supply = await this.erc721a.totalSupply();
      expect(supply).to.equal(0);
    });
  });

  context('with minted tokens', async function () {
    beforeEach(async function () {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      this.addr2 = addr2;
      this.addr3 = addr3;
      await this.erc721a['safeMint(address,uint256)'](addr1.address, 1);
      await this.erc721a['safeMint(address,uint256)'](addr2.address, 2);
      await this.erc721a['safeMint(address,uint256)'](addr3.address, 3);
    });

    describe('exists', async function () {
      it('verifies valid tokens', async function () {
        for (let tokenId = 0; tokenId < 6; tokenId++) {
          let exists = await this.erc721a.exists(tokenId);
          expect(exists).to.be.true;
        }
      });

      it('verifies invalid tokens', async function () {
        const exists = await this.erc721a.exists(6);
        expect(exists).to.be.false;
      });
    });

    describe('balanceOf', async function () {
      it('returns the amount for a given address', async function () {
        expect(await this.erc721a.balanceOf(this.owner.address)).to.equal('0');
        expect(await this.erc721a.balanceOf(this.addr1.address)).to.equal('1');
        expect(await this.erc721a.balanceOf(this.addr2.address)).to.equal('2');
        expect(await this.erc721a.balanceOf(this.addr3.address)).to.equal('3');
      });

      it('throws an exception for the 0 address', async function () {
        await expectRevert(
          this.erc721a.balanceOf(ZERO_ADDRESS), 'ERC721A: balance query for the zero address',
        );
      });
    });

    describe('_numberMinted', async function () {
      it('returns the amount for a given address', async function () {
        expect(await this.erc721a.numberMinted(this.owner.address)).to.equal('0');
        expect(await this.erc721a.numberMinted(this.addr1.address)).to.equal('1');
        expect(await this.erc721a.numberMinted(this.addr2.address)).to.equal('2');
        expect(await this.erc721a.numberMinted(this.addr3.address)).to.equal('3');
      });
    });

    describe('ownerOf', async function () {
      it('returns the right owner', async function () {
        expect(await this.erc721a.ownerOf(0)).to.equal(this.addr1.address);
        expect(await this.erc721a.ownerOf(1)).to.equal(this.addr2.address);
        expect(await this.erc721a.ownerOf(5)).to.equal(this.addr3.address);
      });

      it('reverts for an invalid token', async function () {
        await expectRevert(
          this.erc721a.ownerOf(10), 'ERC721A: owner query for nonexistent token',
        );
      });
    });

    describe('approval logic', async function () {
      const tokenId = 0;
      const tokenId2 = 1;

      it('approves successfully', async function () {
        await this.erc721a.connect(this.addr1).approve(this.addr2.address, tokenId);
        const approval = await this.erc721a.getApproved(tokenId);
        expect(approval).to.equal(this.addr2.address);
      });

      it('rejects an invalid token owner', async function () {
        await expectRevert(
          this.erc721a.connect(this.addr1).approve(this.addr2.address, tokenId2), 'ERC721A: approval to current owner'
        );
      });

      it('rejects an unapproved caller', async function () {
        await expectRevert(
          this.erc721a.approve(this.addr2.address, tokenId), 'ERC721A: approve caller is not owner nor approved for all'
        );
      });

      it('does not get approved for invalid tokens', async function () {
        await expectRevert(
          this.erc721a.getApproved(10), 'ERC721A: approved query for nonexistent token'
        );
      });
    });
  });
});