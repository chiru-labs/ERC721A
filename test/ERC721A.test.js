const { deployContract } = require('./helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const RECEIVER_MAGIC_VALUE = '0x150b7a02';
const GAS_MAGIC_VALUE = 20000;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721a = await deployContract(contract, constructorArgs);
        this.receiver = await deployContract('ERC721ReceiverMock', [RECEIVER_MAGIC_VALUE]);
        this.startTokenId = this.erc721a.startTokenId ? (await this.erc721a.startTokenId()).toNumber() : 0;
      });

      describe('EIP-165 support', async function () {
        it('supports IERC721', async function () {
          expect(await this.erc721a.supportsInterface('0x80ac58cd')).to.eq(true);
        })

        it('supports ERC721Metadata', async function () {
          expect(await this.erc721a.supportsInterface('0x5b5e139f')).to.eq(true);
        })

        it('does not support ERC721Enumerable', async function () {
          expect(await this.erc721a.supportsInterface('0x780e9d63')).to.eq(false);
        })

        it('does not support random interface', async function () {
          expect(await this.erc721a.supportsInterface('0x00000042')).to.eq(false);
        })
      })

      context('with no minted tokens', async function () {
        it('has 0 totalSupply', async function () {
          const supply = await this.erc721a.totalSupply();
          expect(supply).to.equal(0);
        });

        it('has 0 totalMinted', async function () {
          const totalMinted = await this.erc721a.totalMinted();
          expect(totalMinted).to.equal(0);
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

        describe('ERC721Metadata support', async function () {
          it('responds with the right name', async function () {
            expect(await this.erc721a.name()).to.eq('Azuki');
          })

          it('responds with the right symbol', async function () {
            expect(await this.erc721a.symbol()).to.eq('AZUKI');
          })

          describe('tokenURI', async function () {
            it('sends an emtpy uri by default', async function () {
              const uri = await this.erc721a['tokenURI(uint256)'](1);
              expect(uri).to.eq('');
            })

            it('reverts when tokenid is invalid', async function () {
              await expect(this.erc721a['tokenURI(uint256)'](42)).to.be.reverted;
            })
          })
        })

        describe('exists', async function () {
          it('verifies valid tokens', async function () {
            for (let tokenId = this.startTokenId; tokenId < 6 + this.startTokenId; tokenId++) {
              const exists = await this.erc721a.exists(tokenId);
              expect(exists).to.be.true;
            }
          });

          it('verifies invalid tokens', async function () {
            expect(await this.erc721a.exists(6 + this.startTokenId)).to.be.false;
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
            await expect(this.erc721a.balanceOf(ZERO_ADDRESS)).to.be.revertedWith('BalanceQueryForZeroAddress');
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

        context('_totalMinted', async function () {
          it('has 6 totalMinted', async function () {
            const totalMinted = await this.erc721a.totalMinted();
            expect(totalMinted).to.equal('6');
          });
        });

        describe('aux', async function () {
          it('get and set works correctly', async function () {
            const uint64Max = '18446744073709551615';
            expect(await this.erc721a.getAux(this.owner.address)).to.equal('0');
            await this.erc721a.setAux(this.owner.address, uint64Max);
            expect(await this.erc721a.getAux(this.owner.address)).to.equal(uint64Max);

            expect(await this.erc721a.getAux(this.addr1.address)).to.equal('0');
            await this.erc721a.setAux(this.addr1.address, '1');
            expect(await this.erc721a.getAux(this.addr1.address)).to.equal('1');

            await this.erc721a.setAux(this.addr3.address, '5');
            expect(await this.erc721a.getAux(this.addr3.address)).to.equal('5');

            expect(await this.erc721a.getAux(this.addr1.address)).to.equal('1');
          });
        });

        describe('ownerOf', async function () {
          it('returns the right owner', async function () {
            expect(await this.erc721a.ownerOf(0 + this.startTokenId)).to.equal(this.addr1.address);
            expect(await this.erc721a.ownerOf(1 + this.startTokenId)).to.equal(this.addr2.address);
            expect(await this.erc721a.ownerOf(5 + this.startTokenId)).to.equal(this.addr3.address);
          });

          it('reverts for an invalid token', async function () {
            await expect(this.erc721a.ownerOf(10)).to.be.revertedWith('OwnerQueryForNonexistentToken');
          });
        });

        describe('approve', async function () {
          beforeEach(function () {
            this.tokenId = this.startTokenId;
            this.tokenId2 = this.startTokenId + 1;
          });

          it('sets approval for the target address', async function () {
            await this.erc721a.connect(this.addr1).approve(this.addr2.address, this.tokenId);
            const approval = await this.erc721a.getApproved(this.tokenId);
            expect(approval).to.equal(this.addr2.address);
          });

          it('rejects an invalid token owner', async function () {
            await expect(
              this.erc721a.connect(this.addr1).approve(this.addr2.address, this.tokenId2)
            ).to.be.revertedWith('ApprovalToCurrentOwner');
          });

          it('rejects an unapproved caller', async function () {
            await expect(this.erc721a.approve(this.addr2.address, this.tokenId)).to.be.revertedWith(
              'ApprovalCallerNotOwnerNorApproved'
            );
          });

          it('does not get approved for invalid tokens', async function () {
            await expect(this.erc721a.getApproved(10)).to.be.revertedWith('ApprovalQueryForNonexistentToken');
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
            await expect(
              this.erc721a.connect(this.addr1).setApprovalForAll(this.addr1.address, true)
            ).to.be.revertedWith('ApproveToCaller');
          });
        });

        context('test transfer functionality', function () {
          const testSuccessfulTransfer = function (transferFn) {
            beforeEach(async function () {
              this.tokenId = this.startTokenId + 1;

              const sender = this.addr2;
              this.from = sender.address;
              this.to = this.receiver.address;
              await this.erc721a.connect(sender).setApprovalForAll(this.to, true);
              this.transferTx = await this.erc721a.connect(sender)[transferFn](this.from, this.to, this.tokenId);
            });

            it('transfers the ownership of the given token ID to the given address', async function () {
              expect(await this.erc721a.ownerOf(this.tokenId)).to.be.equal(this.to);
            });

            it('emits a Transfer event', async function () {
              await expect(this.transferTx)
                .to.emit(this.erc721a, 'Transfer')
                .withArgs(this.from, this.to, this.tokenId);
            });

            it('clears the approval for the token ID', async function () {
              expect(await this.erc721a.getApproved(this.tokenId)).to.be.equal(ZERO_ADDRESS);
            });

            it('emits an Approval event', async function () {
              await expect(this.transferTx)
                .to.emit(this.erc721a, 'Approval')
                .withArgs(this.from, ZERO_ADDRESS, this.tokenId);
            });

            it('adjusts owners balances', async function () {
              expect(await this.erc721a.balanceOf(this.from)).to.be.equal(1);
            });
          };

          const testUnsuccessfulTransfer = function (transferFn) {
            beforeEach(function () {
              this.tokenId = this.startTokenId + 1;
            });

            it('rejects unapproved transfer', async function () {
              await expect(
                this.erc721a.connect(this.addr1)[transferFn](this.addr2.address, this.addr1.address, this.tokenId)
              ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
            });

            it('rejects transfer from incorrect owner', async function () {
              await this.erc721a.connect(this.addr2).setApprovalForAll(this.addr1.address, true);
              await expect(
                this.erc721a.connect(this.addr1)[transferFn](this.addr3.address, this.addr1.address, this.tokenId)
              ).to.be.revertedWith('TransferFromIncorrectOwner');
            });

            it('rejects transfer to zero address', async function () {
              await this.erc721a.connect(this.addr2).setApprovalForAll(this.addr1.address, true);
              await expect(
                this.erc721a.connect(this.addr1)[transferFn](this.addr2.address, ZERO_ADDRESS, this.tokenId)
              ).to.be.revertedWith('TransferToZeroAddress');
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
                  .withArgs(this.addr2.address, this.addr2.address, 1 + this.startTokenId, '0x', GAS_MAGIC_VALUE);
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

        describe('_burn', async function() {
          beforeEach(function () {
            this.tokenIdToBurn = this.startTokenId;
          });

          it('can burn if approvalCheck is false', async function () {
            await this.erc721a.connect(this.addr2).burn(this.tokenIdToBurn, false);
            expect(await this.erc721a.exists(this.tokenIdToBurn)).to.be.false;
          });

          it('revert if approvalCheck is true', async function () {
            await expect(
              this.erc721a.connect(this.addr2).burn(this.tokenIdToBurn, true)
            ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
          });
        });
      });

      context('mint', async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
        });

        describe('safeMint', function () {
          it('successfully mints a single token', async function () {
            const mintTx = await this.erc721a['safeMint(address,uint256)'](this.receiver.address, 1);
            await expect(mintTx)
              .to.emit(this.erc721a, 'Transfer')
              .withArgs(ZERO_ADDRESS, this.receiver.address, this.startTokenId);
            await expect(mintTx)
              .to.emit(this.receiver, 'Received')
              .withArgs(this.owner.address, ZERO_ADDRESS, this.startTokenId, '0x', GAS_MAGIC_VALUE);
            expect(await this.erc721a.ownerOf(this.startTokenId)).to.equal(this.receiver.address);
          });

          it('successfully mints multiple tokens', async function () {
            const mintTx = await this.erc721a['safeMint(address,uint256)'](this.receiver.address, 5);
            for (let tokenId = this.startTokenId; tokenId < 5 + this.startTokenId; tokenId++) {
              await expect(mintTx)
                .to.emit(this.erc721a, 'Transfer')
                .withArgs(ZERO_ADDRESS, this.receiver.address, tokenId);
              await expect(mintTx)
                .to.emit(this.receiver, 'Received')
                .withArgs(this.owner.address, ZERO_ADDRESS, tokenId, '0x', GAS_MAGIC_VALUE);
              expect(await this.erc721a.ownerOf(tokenId)).to.equal(this.receiver.address);
            }
          });

          it('rejects mints to the zero address', async function () {
            await expect(this.erc721a['safeMint(address,uint256)'](ZERO_ADDRESS, 1)).to.be.revertedWith(
              'MintToZeroAddress'
            );
          });

          it('requires quantity to be greater than 0', async function () {
            await expect(this.erc721a['safeMint(address,uint256)'](this.owner.address, 0)).to.be.revertedWith(
              'MintZeroQuantity'
            );
          });

          it('reverts for non-receivers', async function () {
            const nonReceiver = this.erc721a;
            await expect(this.erc721a['safeMint(address,uint256)'](nonReceiver.address, 1)).to.be.revertedWith(
              'TransferToNonERC721ReceiverImplementer'
            );
          });
        });

        describe('mint', function () {
          it('successfully mints a single token', async function () {
            const mintTx = await this.erc721a.mint(this.receiver.address, 1);
            await expect(mintTx)
              .to.emit(this.erc721a, 'Transfer')
              .withArgs(ZERO_ADDRESS, this.receiver.address, this.startTokenId);
            await expect(mintTx).to.not.emit(this.receiver, 'Received');
            expect(await this.erc721a.ownerOf(this.startTokenId)).to.equal(this.receiver.address);
          });

          it('successfully mints multiple tokens', async function () {
            const mintTx = await this.erc721a.mint(this.receiver.address, 5);
            for (let tokenId = this.startTokenId; tokenId < 5 + this.startTokenId; tokenId++) {
              await expect(mintTx)
                .to.emit(this.erc721a, 'Transfer')
                .withArgs(ZERO_ADDRESS, this.receiver.address, tokenId);
              await expect(mintTx).to.not.emit(this.receiver, 'Received');
              expect(await this.erc721a.ownerOf(tokenId)).to.equal(this.receiver.address);
            }
          });

          it('does not revert for non-receivers', async function () {
            const nonReceiver = this.erc721a;
            await this.erc721a.mint(nonReceiver.address, 1);
            expect(await this.erc721a.ownerOf(this.startTokenId)).to.equal(nonReceiver.address);
          });

          it('rejects mints to the zero address', async function () {
            await expect(this.erc721a.mint(ZERO_ADDRESS, 1)).to.be.revertedWith('MintToZeroAddress');
          });

          it('requires quantity to be greater than 0', async function () {
            await expect(this.erc721a.mint(this.owner.address, 0)).to.be.revertedWith('MintZeroQuantity');
          });
        });
      });
    });
  };

describe('ERC721A', createTestSuite({ contract: 'ERC721AMock', constructorArgs: ['Azuki', 'AZUKI'] }));

describe(
  'ERC721A override _startTokenId()',
  createTestSuite({ contract: 'ERC721AStartTokenIdMock', constructorArgs: ['Azuki', 'AZUKI', 1] })
);
