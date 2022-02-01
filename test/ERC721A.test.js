const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const RECEIVER_MAGIC_VALUE = '0x150b7a02';
const GAS_MAGIC_VALUE = 20000;

describe('ERC721A', function () {
  beforeEach(async function () {
    this.ERC721A = await ethers.getContractFactory('ERC721AMock');
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
    this.erc721a = await this.ERC721A.deploy('Azuki', 'AZUKI');
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
          const exists = await this.erc721a.exists(tokenId);
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
        await expect(this.erc721a.balanceOf(ZERO_ADDRESS)).to.be.revertedWith(
          'ERC721A: balance query for the zero address'
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
        await expect(this.erc721a.ownerOf(10)).to.be.revertedWith('ERC721A: owner query for nonexistent token');
      });
    });

    describe('approve', async function () {
      const tokenId = 0;
      const tokenId2 = 1;

      it('sets approval for the target address', async function () {
        await this.erc721a.connect(this.addr1).approve(this.addr2.address, tokenId);
        const approval = await this.erc721a.getApproved(tokenId);
        expect(approval).to.equal(this.addr2.address);
      });

      it('rejects an invalid token owner', async function () {
        await expect(this.erc721a.connect(this.addr1).approve(this.addr2.address, tokenId2)).to.be.revertedWith(
          'ERC721A: approval to current owner'
        );
      });

      it('rejects an unapproved caller', async function () {
        await expect(this.erc721a.approve(this.addr2.address, tokenId)).to.be.revertedWith(
          'ERC721A: approve caller is not owner nor approved for all'
        );
      });

      it('does not get approved for invalid tokens', async function () {
        await expect(this.erc721a.getApproved(10)).to.be.revertedWith('ERC721A: approved query for nonexistent token');
      });
    });

    describe('setApprovalForAll', async function () {
      it('sets approval for all properly', async function () {
        const approvalTx = await this.erc721a.setApprovalForAll(this.addr1.address, true);
        await expect(approvalTx)
          .to.emit(this.erc721a, 'ApprovalForAll')
          .withArgs(this.owner.address, this.addr1.address, true);
        expect(await this.erc721a.isApprovedForAll(this.owner.address, this.addr1.address)).to.be.true;
      });

      it('sets rejects approvals for non msg senders', async function () {
        await expect(this.erc721a.connect(this.addr1).setApprovalForAll(this.addr1.address, true)).to.be.revertedWith(
          'ERC721A: approve to caller'
        );
      });
    });

    context('test transfer functionality', function () {
      const testSuccessfulTransfer = function (transferFn) {
        const tokenId = 1;
        let from;
        let to;

        beforeEach(async function () {
          const sender = this.addr2;
          from = sender.address;
          this.receiver = await this.ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE);
          to = this.receiver.address;
          await this.erc721a.connect(sender).setApprovalForAll(to, true);
          this.transferTx = await this.erc721a.connect(sender)[transferFn](from, to, tokenId);
        });

        it('transfers the ownership of the given token ID to the given address', async function () {
          expect(await this.erc721a.ownerOf(tokenId)).to.be.equal(to);
        });

        it('emits a Transfer event', async function () {
          await expect(this.transferTx).to.emit(this.erc721a, 'Transfer').withArgs(from, to, tokenId);
        });

        it('clears the approval for the token ID', async function () {
          expect(await this.erc721a.getApproved(tokenId)).to.be.equal(ZERO_ADDRESS);
        });

        it('emits an Approval event', async function () {
          await expect(this.transferTx).to.emit(this.erc721a, 'Approval').withArgs(from, ZERO_ADDRESS, tokenId);
        });

        it('adjusts owners balances', async function () {
          expect(await this.erc721a.balanceOf(from)).to.be.equal(1);
        });

        it('adjusts owners tokens by index', async function () {
          expect(await this.erc721a.tokenOfOwnerByIndex(to, 0)).to.be.equal(tokenId);
          expect(await this.erc721a.tokenOfOwnerByIndex(from, 0)).to.be.not.equal(tokenId);
        });
      };

      const testUnsuccessfulTransfer = function (transferFn) {
        const tokenId = 1;

        it('rejects unapproved transfer', async function () {
          await expect(
            this.erc721a.connect(this.addr1)[transferFn](this.addr2.address, this.addr1.address, tokenId)
          ).to.be.revertedWith('ERC721A: transfer caller is not owner nor approved');
        });

        it('rejects transfer from incorrect owner', async function () {
          await this.erc721a.connect(this.addr2).setApprovalForAll(this.addr1.address, true);
          await expect(
            this.erc721a.connect(this.addr1)[transferFn](this.addr3.address, this.addr1.address, tokenId)
          ).to.be.revertedWith('ERC721A: transfer from incorrect owner');
        });

        it('rejects transfer to zero address', async function () {
          await this.erc721a.connect(this.addr2).setApprovalForAll(this.addr1.address, true);
          await expect(
            this.erc721a.connect(this.addr1)[transferFn](this.addr2.address, ZERO_ADDRESS, tokenId)
          ).to.be.revertedWith('ERC721A: transfer to the zero address');
        });
      };

      context('successful transfers', function () {
        describe('transferFrom', function () {
          testSuccessfulTransfer('transferFrom');
        });

        describe('safeTransferFrom', function () {
          testSuccessfulTransfer('safeTransferFrom(address,address,uint256)');

          it('validates ERC721Received', async function () {
            await expect(this.transferTx)
              .to.emit(this.receiver, 'Received')
              .withArgs(this.addr2.address, this.addr2.address, 1, '0x', GAS_MAGIC_VALUE);
          });
        });
      });

      context('unsuccessful transfers', function () {
        describe('transferFrom', function () {
          testUnsuccessfulTransfer('transferFrom');
        });

        describe('safeTransferFrom', function () {
          testUnsuccessfulTransfer('safeTransferFrom(address,address,uint256)');
        });
      });
    });
  });

  context('mint', async function () {
    beforeEach(async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      this.addr2 = addr2;
      this.receiver = await this.ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE);
    });

    describe('safeMint', function () {
      it('successfully mints a single token', async function () {
        const mintTx = await this.erc721a['safeMint(address,uint256)'](this.receiver.address, 1);
        await expect(mintTx).to.emit(this.erc721a, 'Transfer').withArgs(ZERO_ADDRESS, this.receiver.address, 0);
        await expect(mintTx)
          .to.emit(this.receiver, 'Received')
          .withArgs(this.owner.address, ZERO_ADDRESS, 0, '0x', GAS_MAGIC_VALUE);
        expect(await this.erc721a.ownerOf(0)).to.equal(this.receiver.address);
      });

      it('successfully mints multiple tokens', async function () {
        const mintTx = await this.erc721a['safeMint(address,uint256)'](this.receiver.address, 5);
        for (let tokenId = 0; tokenId < 5; tokenId++) {
          await expect(mintTx).to.emit(this.erc721a, 'Transfer').withArgs(ZERO_ADDRESS, this.receiver.address, tokenId);
          await expect(mintTx)
            .to.emit(this.receiver, 'Received')
            .withArgs(this.owner.address, ZERO_ADDRESS, 0, '0x', GAS_MAGIC_VALUE);
          expect(await this.erc721a.ownerOf(tokenId)).to.equal(this.receiver.address);
        }
      });

      it('rejects mints to the zero address', async function () {
        await expect(this.erc721a['safeMint(address,uint256)'](ZERO_ADDRESS, 1)).to.be.revertedWith(
          'ERC721A: mint to the zero address'
        );
      });

      it('requires quantity to be greater than 0', async function () {
        await expect(this.erc721a['safeMint(address,uint256)'](this.owner.address, 0)).to.be.revertedWith(
          'ERC721A: quantity must be greater than 0'
        );
      });

      it('reverts for non-receivers', async function () {
        const nonReceiver = this.erc721a;
        await expect(this.erc721a['safeMint(address,uint256)'](nonReceiver.address, 1)).to.be.revertedWith(
          'ERC721A: transfer to non ERC721Receiver implementer'
        );
      });
    });

    describe('mint', function () {
      const data = '0x42';

      it('successfully mints a single token', async function () {
        const mintTx = await this.erc721a.mint(this.receiver.address, 1, data, false);
        await expect(mintTx).to.emit(this.erc721a, 'Transfer').withArgs(ZERO_ADDRESS, this.receiver.address, 0);
        await expect(mintTx).to.not.emit(this.receiver, 'Received')
        expect(await this.erc721a.ownerOf(0)).to.equal(this.receiver.address);
      });

      it('successfully mints multiple tokens', async function () {
        const mintTx = await this.erc721a.mint(this.receiver.address, 5, data, false);
        for (let tokenId = 0; tokenId < 5; tokenId++) {
          await expect(mintTx).to.emit(this.erc721a, 'Transfer').withArgs(ZERO_ADDRESS, this.receiver.address, tokenId);
          await expect(mintTx).to.not.emit(this.receiver, 'Received')
          expect(await this.erc721a.ownerOf(tokenId)).to.equal(this.receiver.address);
        }
      });

      it('does not revert for non-receivers', async function () {
        const nonReceiver = this.erc721a;
        await this.erc721a.mint(nonReceiver.address, 1, data, false);
        expect(await this.erc721a.ownerOf(0)).to.equal(nonReceiver.address);
      });

      it('rejects mints to the zero address', async function () {
        await expect(this.erc721a.mint(ZERO_ADDRESS, 1, data, false)).to.be.revertedWith(
          'ERC721A: mint to the zero address'
        );
      });

      it('requires quantity to be greater than 0', async function () {
        await expect(this.erc721a.mint(this.owner.address, 0, data, false)).to.be.revertedWith(
          'ERC721A: quantity must be greater than 0'
        );
      });
    });
  });
});
