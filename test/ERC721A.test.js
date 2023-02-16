const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('./helpers.js');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const RECEIVER_MAGIC_VALUE = '0x150b7a02';
const GAS_MAGIC_VALUE = 20000;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721a = await deployContract(contract, constructorArgs);
        this.receiver = await deployContract('ERC721ReceiverMock', [RECEIVER_MAGIC_VALUE, this.erc721a.address]);
        this.startTokenId = this.erc721a.startTokenId ? (await this.erc721a.startTokenId()).toNumber() : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
      });

      describe('EIP-165 support', async function () {
        it('supports ERC165', async function () {
          expect(await this.erc721a.supportsInterface('0x01ffc9a7')).to.eq(true);
        });

        it('supports IERC721', async function () {
          expect(await this.erc721a.supportsInterface('0x80ac58cd')).to.eq(true);
        });

        it('supports ERC721Metadata', async function () {
          expect(await this.erc721a.supportsInterface('0x5b5e139f')).to.eq(true);
        });

        it('does not support ERC721Enumerable', async function () {
          expect(await this.erc721a.supportsInterface('0x780e9d63')).to.eq(false);
        });

        it('does not support random interface', async function () {
          expect(await this.erc721a.supportsInterface('0x00000042')).to.eq(false);
        });
      });

      describe('ERC721Metadata support', async function () {
        it('name', async function () {
          expect(await this.erc721a.name()).to.eq(constructorArgs[0]);
        });

        it('symbol', async function () {
          expect(await this.erc721a.symbol()).to.eq(constructorArgs[1]);
        });

        describe('baseURI', async function () {
          it('sends an empty URI by default', async function () {
            expect(await this.erc721a.baseURI()).to.eq('');
          });
        });
      });

      context('with no minted tokens', async function () {
        it('has 0 totalSupply', async function () {
          const supply = await this.erc721a.totalSupply();
          expect(supply).to.equal(0);
        });

        it('has 0 totalMinted', async function () {
          const totalMinted = await this.erc721a.totalMinted();
          expect(totalMinted).to.equal(0);
        });

        it('has 0 totalBurned', async function () {
          const totalBurned = await this.erc721a.totalBurned();
          expect(totalBurned).to.equal(0);
        });

        it('_nextTokenId must be equal to _startTokenId', async function () {
          const nextTokenId = await this.erc721a.nextTokenId();
          expect(nextTokenId).to.equal(offsetted(0));
        });
      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
          this.addr3 = addr3;
          this.addr4 = addr4;
          this.expectedMintCount = 6;

          this.addr1.expected = {
            mintCount: 1,
            tokens: [offsetted(0)],
          };

          this.addr2.expected = {
            mintCount: 2,
            tokens: offsetted(1, 2),
          };

          this.addr3.expected = {
            mintCount: 3,
            tokens: offsetted(3, 4, 5),
          };

          await this.erc721a['safeMint(address,uint256)'](addr1.address, this.addr1.expected.mintCount);
          await this.erc721a['safeMint(address,uint256)'](addr2.address, this.addr2.expected.mintCount);
          await this.erc721a['safeMint(address,uint256)'](addr3.address, this.addr3.expected.mintCount);
        });

        describe('tokenURI (ERC721Metadata)', async function () {
          describe('tokenURI', async function () {
            it('sends an empty uri by default', async function () {
              expect(await this.erc721a.tokenURI(offsetted(0))).to.eq('');
            });

            it('reverts when tokenId does not exist', async function () {
              await expect(this.erc721a.tokenURI(offsetted(this.expectedMintCount))).to.be.revertedWith(
                'URIQueryForNonexistentToken'
              );
            });
          });
        });

        describe('exists', async function () {
          it('verifies valid tokens', async function () {
            for (let tokenId = offsetted(0); tokenId < offsetted(this.expectedMintCount); tokenId++) {
              const exists = await this.erc721a.exists(tokenId);
              expect(exists).to.be.true;
            }
          });

          it('verifies invalid tokens', async function () {
            expect(await this.erc721a.exists(offsetted(this.expectedMintCount))).to.be.false;
          });
        });

        describe('balanceOf', async function () {
          it('returns the amount for a given address', async function () {
            expect(await this.erc721a.balanceOf(this.owner.address)).to.equal('0');
            expect(await this.erc721a.balanceOf(this.addr1.address)).to.equal(this.addr1.expected.mintCount);
            expect(await this.erc721a.balanceOf(this.addr2.address)).to.equal(this.addr2.expected.mintCount);
            expect(await this.erc721a.balanceOf(this.addr3.address)).to.equal(this.addr3.expected.mintCount);
          });

          it('returns correct amount with transferred tokens', async function () {
            const tokenIdToTransfer = this.addr2.expected.tokens[0];
            await this.erc721a
              .connect(this.addr2)
              .transferFrom(this.addr2.address, this.addr3.address, tokenIdToTransfer);
            // sanity check
            expect(await this.erc721a.ownerOf(tokenIdToTransfer)).to.equal(this.addr3.address);

            expect(await this.erc721a.balanceOf(this.addr2.address)).to.equal(this.addr2.expected.mintCount - 1);
            expect(await this.erc721a.balanceOf(this.addr3.address)).to.equal(this.addr3.expected.mintCount + 1);
          });

          it('throws an exception for the 0 address', async function () {
            await expect(this.erc721a.balanceOf(ZERO_ADDRESS)).to.be.revertedWith('BalanceQueryForZeroAddress');
          });
        });

        describe('_numberMinted', async function () {
          it('returns the amount for a given address', async function () {
            expect(await this.erc721a.numberMinted(this.owner.address)).to.equal('0');
            expect(await this.erc721a.numberMinted(this.addr1.address)).to.equal(this.addr1.expected.mintCount);
            expect(await this.erc721a.numberMinted(this.addr2.address)).to.equal(this.addr2.expected.mintCount);
            expect(await this.erc721a.numberMinted(this.addr3.address)).to.equal(this.addr3.expected.mintCount);
          });

          it('returns the same amount with transferred token', async function () {
            const tokenIdToTransfer = this.addr2.expected.tokens[0];
            await this.erc721a
              .connect(this.addr2)
              .transferFrom(this.addr2.address, this.addr3.address, tokenIdToTransfer);
            // sanity check
            expect(await this.erc721a.ownerOf(tokenIdToTransfer)).to.equal(this.addr3.address);

            expect(await this.erc721a.numberMinted(this.addr2.address)).to.equal(this.addr2.expected.mintCount);
            expect(await this.erc721a.numberMinted(this.addr3.address)).to.equal(this.addr3.expected.mintCount);
          });
        });

        context('_totalMinted', async function () {
          it('has correct totalMinted', async function () {
            const totalMinted = await this.erc721a.totalMinted();
            expect(totalMinted).to.equal(this.expectedMintCount);
          });
        });

        context('_nextTokenId', async function () {
          it('has correct nextTokenId', async function () {
            const nextTokenId = await this.erc721a.nextTokenId();
            expect(nextTokenId).to.equal(offsetted(this.expectedMintCount));
          });
        });

        describe('aux', async function () {
          it('get and set works correctly', async function () {
            const uint64Max = BigNumber.from(2).pow(64).sub(1).toString();
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
            for (const minter of [this.addr1, this.addr2, this.addr3]) {
              for (const tokenId of minter.expected.tokens) {
                expect(await this.erc721a.ownerOf(tokenId)).to.equal(minter.address);
              }
            }
          });

          it('reverts for an invalid token', async function () {
            await expect(this.erc721a.ownerOf(10)).to.be.revertedWith('OwnerQueryForNonexistentToken');

            if (this.startTokenId > 0) {
              await expect(this.erc721a.ownerOf(0)).to.be.revertedWith('OwnerQueryForNonexistentToken');
            }
          });
        });

        describe('approve', async function () {
          beforeEach(function () {
            this.tokenId = this.addr1.expected.tokens[0];
            this.tokenId2 = this.addr2.expected.tokens[0];
          });

          it('sets approval for the target address', async function () {
            await this.erc721a.connect(this.addr1).approve(this.addr2.address, this.tokenId);
            const approval = await this.erc721a.getApproved(this.tokenId);
            expect(approval).to.equal(this.addr2.address);
          });

          it('set approval for the target address on behalf of the owner', async function () {
            await this.erc721a.connect(this.addr1).setApprovalForAll(this.addr2.address, true);
            await this.erc721a.connect(this.addr2).approve(this.addr3.address, this.tokenId);
            const approval = await this.erc721a.getApproved(this.tokenId);
            expect(approval).to.equal(this.addr3.address);
          });

          it('rejects an unapproved caller', async function () {
            await expect(this.erc721a.approve(this.addr2.address, this.tokenId)).to.be.revertedWith(
              'ApprovalCallerNotOwnerNorApproved'
            );
          });

          it('does not get approved for invalid tokens', async function () {
            await expect(this.erc721a.getApproved(10)).to.be.revertedWith('ApprovalQueryForNonexistentToken');
          });

          it('approval allows token transfer', async function () {
            await expect(
              this.erc721a.connect(this.addr3).transferFrom(this.addr1.address, this.addr3.address, this.tokenId)
            ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
            await this.erc721a.connect(this.addr1).approve(this.addr3.address, this.tokenId);
            await this.erc721a.connect(this.addr3).transferFrom(this.addr1.address, this.addr3.address, this.tokenId);
            await expect(
              this.erc721a.connect(this.addr1).transferFrom(this.addr3.address, this.addr1.address, this.tokenId)
            ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
          });

          it('token owner can approve self as operator', async function () {
            expect(await this.erc721a.getApproved(this.tokenId)).to.not.equal(this.addr1.address);
            await expect(this.erc721a.connect(this.addr1).approve(this.addr1.address, this.tokenId)
            ).to.not.be.reverted;
            expect(await this.erc721a.getApproved(this.tokenId)).to.equal(this.addr1.address);
          });

          it('self-approval is cleared on token transfer', async function () {
            await this.erc721a.connect(this.addr1).approve(this.addr1.address, this.tokenId); 
            expect(await this.erc721a.getApproved(this.tokenId)).to.equal(this.addr1.address);

            await this.erc721a.connect(this.addr1).transferFrom(this.addr1.address, this.addr2.address, this.tokenId);
            expect(await this.erc721a.getApproved(this.tokenId)).to.not.equal(this.addr1.address);
          });

          it('direct approve works', async function () {
            expect(await this.erc721a.getApproved(this.tokenId)).to.not.equal(this.addr1.address);
            await this.erc721a.connect(this.addr2).directApprove(this.addr1.address, this.tokenId); 
            expect(await this.erc721a.getApproved(this.tokenId)).to.equal(this.addr1.address);
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

          it('caller can approve all with self as operator', async function () {
            expect(
              await this.erc721a.connect(this.addr1).isApprovedForAll(this.addr1.address, this.addr1.address)
            ).to.be.false;
            await expect(
              this.erc721a.connect(this.addr1).setApprovalForAll(this.addr1.address, true)
            ).to.not.be.reverted;
            expect(
              await this.erc721a.connect(this.addr1).isApprovedForAll(this.addr1.address, this.addr1.address)
            ).to.be.true;
          });
        });

        context('test transfer functionality', function () {
          const testSuccessfulTransfer = function (transferFn, transferToContract = true) {
            beforeEach(async function () {
              const sender = this.addr2;
              this.tokenId = this.addr2.expected.tokens[0];
              this.from = sender.address;
              this.to = transferToContract ? this.receiver : this.addr4;
              await this.erc721a.connect(sender).approve(this.to.address, this.tokenId);

              const ownershipBefore = await this.erc721a.getOwnershipAt(this.tokenId);
              this.timestampBefore = parseInt(ownershipBefore.startTimestamp);
              this.timestampToMine = (await getBlockTimestamp()) + 12345;
              await mineBlockTimestamp(this.timestampToMine);
              this.timestampMined = await getBlockTimestamp();

              // prettier-ignore
              this.transferTx = await this.erc721a
                .connect(sender)[transferFn](this.from, this.to.address, this.tokenId);

              const ownershipAfter = await this.erc721a.getOwnershipAt(this.tokenId);
              this.timestampAfter = parseInt(ownershipAfter.startTimestamp);
            });

            it('transfers the ownership of the given token ID to the given address', async function () {
              expect(await this.erc721a.ownerOf(this.tokenId)).to.be.equal(this.to.address);
            });

            it('emits a Transfer event', async function () {
              await expect(this.transferTx)
                .to.emit(this.erc721a, 'Transfer')
                .withArgs(this.from, this.to.address, this.tokenId);
            });

            it('clears the approval for the token ID', async function () {
              expect(await this.erc721a.getApproved(this.tokenId)).to.be.equal(ZERO_ADDRESS);
            });

            it('adjusts owners balances', async function () {
              expect(await this.erc721a.balanceOf(this.from)).to.be.equal(1);
            });

            it('startTimestamp updated correctly', async function () {
              expect(this.timestampBefore).to.be.lt(this.timestampToMine);
              expect(this.timestampAfter).to.be.gte(this.timestampToMine);
              expect(this.timestampAfter).to.be.lt(this.timestampToMine + 10);
              expect(this.timestampToMine).to.be.eq(this.timestampMined);
            });
          };

          const testUnsuccessfulTransfer = function (transferFn) {
            beforeEach(function () {
              this.tokenId = this.addr2.expected.tokens[0];
              this.sender = this.addr1;
            });

            it('rejects unapproved transfer', async function () {
              await expect(
                this.erc721a.connect(this.sender)[transferFn](this.addr2.address, this.sender.address, this.tokenId)
              ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
            });

            it('rejects transfer from incorrect owner', async function () {
              await this.erc721a.connect(this.addr2).setApprovalForAll(this.sender.address, true);
              await expect(
                this.erc721a.connect(this.sender)[transferFn](this.addr3.address, this.sender.address, this.tokenId)
              ).to.be.revertedWith('TransferFromIncorrectOwner');
            });

            it('rejects transfer to zero address', async function () {
              await this.erc721a.connect(this.addr2).setApprovalForAll(this.sender.address, true);
              await expect(
                this.erc721a.connect(this.sender)[transferFn](this.addr2.address, ZERO_ADDRESS, this.tokenId)
              ).to.be.revertedWith('TransferToZeroAddress');
            });
          };

          context('successful transfers', function () {
            context('transferFrom', function () {
              describe('to contract', function () {
                testSuccessfulTransfer('transferFrom');
              });

              describe('to EOA', function () {
                testSuccessfulTransfer('transferFrom', false);
              });
            });

            context('safeTransferFrom', function () {
              describe('to contract', function () {
                testSuccessfulTransfer('safeTransferFrom(address,address,uint256)');

                it('validates ERC721Received', async function () {
                  await expect(this.transferTx)
                    .to.emit(this.receiver, 'Received')
                    .withArgs(this.addr2.address, this.addr2.address, this.tokenId, '0x', GAS_MAGIC_VALUE);
                });
              });

              describe('to EOA', function () {
                testSuccessfulTransfer('safeTransferFrom(address,address,uint256)', false);
              });
            });
          });

          context('unsuccessful transfers', function () {
            describe('transferFrom', function () {
              testUnsuccessfulTransfer('transferFrom');
            });

            describe('safeTransferFrom', function () {
              testUnsuccessfulTransfer('safeTransferFrom(address,address,uint256)');

              it('reverts for non-receivers', async function () {
                const nonReceiver = this.erc721a;
                // prettier-ignore
                await expect(
                  this.erc721a.connect(this.addr1)['safeTransferFrom(address,address,uint256)'](
                      this.addr1.address,
                      nonReceiver.address,
                      offsetted(0)
                    )
                ).to.be.revertedWith('TransferToNonERC721ReceiverImplementer');
              });

              it('reverts when the receiver reverted', async function () {
                // prettier-ignore
                await expect(
                  this.erc721a.connect(this.addr1)['safeTransferFrom(address,address,uint256,bytes)'](
                      this.addr1.address,
                      this.receiver.address,
                      offsetted(0),
                      '0x01'
                    )
                ).to.be.revertedWith('reverted in the receiver contract!');
              });

              it('reverts if the receiver returns the wrong value', async function () {
                // prettier-ignore
                await expect(
                  this.erc721a.connect(this.addr1)['safeTransferFrom(address,address,uint256,bytes)'](
                      this.addr1.address,
                      this.receiver.address,
                      offsetted(0),
                      '0x02'
                    )
                ).to.be.revertedWith('TransferToNonERC721ReceiverImplementer');
              });
            });
          });
        });

        describe('_burn', async function () {
          beforeEach(function () {
            this.tokenIdToBurn = offsetted(0);
          });

          it('can burn if approvalCheck is false', async function () {
            expect(await this.erc721a.exists(this.tokenIdToBurn)).to.be.true;
            await this.erc721a.connect(this.addr2)['burn(uint256,bool)'](this.tokenIdToBurn, false);
            expect(await this.erc721a.exists(this.tokenIdToBurn)).to.be.false;
          });

          it('revert if approvalCheck is true', async function () {
            await expect(
              this.erc721a.connect(this.addr2)['burn(uint256,bool)'](this.tokenIdToBurn, true)
            ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
          });

          it('can burn without approvalCheck parameter', async function () {
            expect(await this.erc721a.exists(this.tokenIdToBurn)).to.be.true;
            await this.erc721a.connect(this.addr2)['burn(uint256)'](this.tokenIdToBurn);
            expect(await this.erc721a.exists(this.tokenIdToBurn)).to.be.false;
          });

          it('cannot burn a token owned by another if not approved', async function () {
            expect(await this.erc721a.exists(this.tokenIdToBurn)).to.be.true;
            await this.erc721a.connect(this.addr2)['burn(uint256)'](this.tokenIdToBurn);
            expect(await this.erc721a.exists(this.tokenIdToBurn)).to.be.false;
          });
        });

        describe('_initializeOwnershipAt', async function () {
          it('successfuly sets ownership of empty slot', async function () {
            const lastTokenId = this.addr3.expected.tokens[2];
            const ownership1 = await this.erc721a.getOwnershipAt(lastTokenId);
            expect(ownership1[0]).to.equal(ZERO_ADDRESS);
            await this.erc721a.initializeOwnershipAt(lastTokenId);
            const ownership2 = await this.erc721a.getOwnershipAt(lastTokenId);
            expect(ownership2[0]).to.equal(this.addr3.address);
          });

          it("doesn't set ownership if it's already setted", async function () {
            const lastTokenId = this.addr3.expected.tokens[2];
            expect(await this.erc721a.ownerOf(lastTokenId)).to.be.equal(this.addr3.address);
            const tx1 = await this.erc721a.initializeOwnershipAt(lastTokenId);
            expect(await this.erc721a.ownerOf(lastTokenId)).to.be.equal(this.addr3.address);
            const tx2 = await this.erc721a.initializeOwnershipAt(lastTokenId);

            // We assume the 2nd initialization doesn't set again due to less gas used.
            const receipt1 = await tx1.wait();
            const receipt2 = await tx2.wait();
            expect(receipt2.gasUsed.toNumber()).to.be.lessThan(receipt1.gasUsed.toNumber());
          });
        });
      });

      context('test mint functionality', function () {
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
        });

        const testSuccessfulMint = function (safe, quantity, mintForContract = true) {
          beforeEach(async function () {
            this.minter = mintForContract ? this.receiver : this.addr1;

            const mintFn = safe ? 'safeMint(address,uint256)' : 'mint(address,uint256)';

            this.balanceBefore = (await this.erc721a.balanceOf(this.minter.address)).toNumber();

            this.timestampToMine = (await getBlockTimestamp()) + 12345;
            await mineBlockTimestamp(this.timestampToMine);
            this.timestampMined = await getBlockTimestamp();

            this.mintTx = await this.erc721a[mintFn](this.minter.address, quantity);
          });

          it('changes ownership', async function () {
            for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
              expect(await this.erc721a.ownerOf(tokenId)).to.equal(this.minter.address);
            }
          });

          it('emits a Transfer event', async function () {
            for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
              await expect(this.mintTx)
                .to.emit(this.erc721a, 'Transfer')
                .withArgs(ZERO_ADDRESS, this.minter.address, tokenId);
            }
          });

          it('adjusts owners balances', async function () {
            expect(await this.erc721a.balanceOf(this.minter.address)).to.be.equal(this.balanceBefore + quantity);
          });

          it('adjusts OwnershipAt and OwnershipOf', async function () {
            const ownership = await this.erc721a.getOwnershipAt(offsetted(0));
            expect(ownership.startTimestamp).to.be.gte(this.timestampToMine);
            expect(ownership.startTimestamp).to.be.lt(this.timestampToMine + 10);
            expect(ownership.burned).to.be.false;

            for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
              const ownership = await this.erc721a.getOwnershipOf(tokenId);
              expect(ownership.addr).to.equal(this.minter.address);
              expect(ownership.startTimestamp).to.be.gte(this.timestampToMine);
              expect(ownership.startTimestamp).to.be.lt(this.timestampToMine + 10);
              expect(ownership.burned).to.be.false;
            }

            expect(this.timestampToMine).to.be.eq(this.timestampMined);
          });

          if (safe && mintForContract) {
            it('validates ERC721Received', async function () {
              for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
                await expect(this.mintTx)
                  .to.emit(this.minter, 'Received')
                  .withArgs(this.owner.address, ZERO_ADDRESS, tokenId, '0x', GAS_MAGIC_VALUE);
              }
            });
          }
        };

        const testUnsuccessfulMint = function (safe) {
          beforeEach(async function () {
            this.mintFn = safe ? 'safeMint(address,uint256)' : 'mint(address,uint256)';
          });

          it('rejects mints to the zero address', async function () {
            await expect(this.erc721a[this.mintFn](ZERO_ADDRESS, 1)).to.be.revertedWith('MintToZeroAddress');
          });

          it('requires quantity to be greater than 0', async function () {
            await expect(this.erc721a[this.mintFn](this.owner.address, 0)).to.be.revertedWith('MintZeroQuantity');
          });
        };

        context('successful mints', function () {
          context('mint', function () {
            context('for contract', function () {
              describe('single token', function () {
                testSuccessfulMint(false, 1);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(false, 5);
              });

              it('does not revert for non-receivers', async function () {
                const nonReceiver = this.erc721a;
                await this.erc721a.mint(nonReceiver.address, 1);
                expect(await this.erc721a.ownerOf(offsetted(0))).to.equal(nonReceiver.address);
              });
            });

            context('for EOA', function () {
              describe('single token', function () {
                testSuccessfulMint(false, 1, false);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(false, 5, false);
              });
            });
          });

          context('safeMint', function () {
            context('for contract', function () {
              describe('single token', function () {
                testSuccessfulMint(true, 1);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(true, 5);
              });

              it('validates ERC721Received with custom _data', async function () {
                const customData = ethers.utils.formatBytes32String('custom data');
                const tx = await this.erc721a['safeMint(address,uint256,bytes)'](this.receiver.address, 1, customData);
                await expect(tx)
                  .to.emit(this.receiver, 'Received')
                  .withArgs(this.owner.address, ZERO_ADDRESS, offsetted(0), customData, GAS_MAGIC_VALUE);
              });
            });

            context('for EOA', function () {
              describe('single token', function () {
                testSuccessfulMint(true, 1, false);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(true, 5, false);
              });
            });
          });
        });

        context('unsuccessful mints', function () {
          context('mint', function () {
            testUnsuccessfulMint(false);
          });

          context('safeMint', function () {
            testUnsuccessfulMint(true);

            it('reverts for non-receivers', async function () {
              const nonReceiver = this.erc721a;
              await expect(this.erc721a['safeMint(address,uint256)'](nonReceiver.address, 1)).to.be.revertedWith(
                'TransferToNonERC721ReceiverImplementer'
              );
            });

            it('reverts when the receiver reverted', async function () {
              await expect(
                this.erc721a['safeMint(address,uint256,bytes)'](this.receiver.address, 1, '0x01')
              ).to.be.revertedWith('reverted in the receiver contract!');
            });

            it('reverts if the receiver returns the wrong value', async function () {
              await expect(
                this.erc721a['safeMint(address,uint256,bytes)'](this.receiver.address, 1, '0x02')
              ).to.be.revertedWith('TransferToNonERC721ReceiverImplementer');
            });

            it('reverts with reentrant call', async function () {
              await expect(
                this.erc721a['safeMint(address,uint256,bytes)'](this.receiver.address, 1, '0x03')
              ).to.be.reverted;
            });
          });
        });
      });

      context('with direct set burn bit', async function () {
        it('ownerOf reverts for an uninitialized burnt token', async function () {
          const [owner] = await ethers.getSigners();
          await this.erc721a['safeMint(address,uint256)'](owner.address, 3);
          await this.erc721a['safeMint(address,uint256)'](owner.address, 2);
          await this.erc721a['safeMint(address,uint256)'](owner.address, 1);
          for (let i = 0; i < 3 + 2 + 1; ++i) {
            expect(await this.erc721a.ownerOf(this.startTokenId + i)).to.eq(owner.address);
          }
          await this.erc721a.directSetBurnBit(this.startTokenId + 3);
          for (let i = 0; i < 3 + 2 + 1; ++i) {
            if (3 <= i && i < 3 + 2) {
              await expect(this.erc721a.ownerOf(this.startTokenId + i))
                .to.be.revertedWith('OwnerQueryForNonexistentToken');
              await expect(this.erc721a.getApproved(this.startTokenId + i))
                .to.be.revertedWith('ApprovalQueryForNonexistentToken');
              await expect(this.erc721a.tokenURI(this.startTokenId + i))
                .to.be.revertedWith('URIQueryForNonexistentToken');
            } else {
              expect(await this.erc721a.ownerOf(this.startTokenId + i)).to.eq(owner.address);  
            }
          }
        });
      });

      context('_toString', async function () {
        it('returns correct value', async function () {
          expect(await this.erc721a['toString(uint256)']('0')).to.eq('0');
          expect(await this.erc721a['toString(uint256)']('1')).to.eq('1');
          expect(await this.erc721a['toString(uint256)']('2')).to.eq('2');
          const uint256Max = BigNumber.from(2).pow(256).sub(1).toString();
          expect(await this.erc721a['toString(uint256)'](uint256Max)).to.eq(uint256Max);
        });
      });
    });
  };

describe('ERC721A', createTestSuite({ contract: 'ERC721AMock', constructorArgs: ['Azuki', 'AZUKI'] }));

describe(
  'ERC721A override _startTokenId()',
  createTestSuite({ contract: 'ERC721AStartTokenIdMock', constructorArgs: ['Azuki', 'AZUKI', 1] })
);

describe('ERC721A with ERC2309', async function () {
  beforeEach(async function () {
    const [owner, addr1] = await ethers.getSigners();
    this.owner = owner;
    this.addr1 = addr1;

    let args;
    args = ['Azuki', 'AZUKI', this.owner.address, 1, true];
    this.erc721aMint1 = await deployContract('ERC721AWithERC2309Mock', args);
    args = ['Azuki', 'AZUKI', this.owner.address, 10, true];
    this.erc721aMint10 = await deployContract('ERC721AWithERC2309Mock', args);
  });

  it('emits a ConsecutiveTransfer event for single mint', async function () {    
    expect(this.erc721aMint1.deployTransaction)
      .to.emit(this.erc721aMint1, 'ConsecutiveTransfer')
      .withArgs(0, 0, ZERO_ADDRESS, this.owner.address);
  });

  it('emits a ConsecutiveTransfer event for a batch mint', async function () {    
    expect(this.erc721aMint10.deployTransaction)
      .to.emit(this.erc721aMint10, 'ConsecutiveTransfer')
      .withArgs(0, 9, ZERO_ADDRESS, this.owner.address);
  });

  it('requires quantity to be below mint limit', async function () {
    let args;
    const mintLimit = 5000;
    args = ['Azuki', 'AZUKI', this.owner.address, mintLimit, true];
    await deployContract('ERC721AWithERC2309Mock', args);
    args = ['Azuki', 'AZUKI', this.owner.address, mintLimit + 1, true];
    await expect(deployContract('ERC721AWithERC2309Mock', args)).to.be.revertedWith('MintERC2309QuantityExceedsLimit');
  })

  it('rejects mints to the zero address', async function () {
    let args = ['Azuki', 'AZUKI', ZERO_ADDRESS, 1, true];
    await expect(deployContract('ERC721AWithERC2309Mock', args)).to.be.revertedWith('MintToZeroAddress');
  });

  it('requires quantity to be greater than 0', async function () {
    let args = ['Azuki', 'AZUKI', this.owner.address, 0, true];
    await expect(deployContract('ERC721AWithERC2309Mock', args)).to.be.revertedWith('MintZeroQuantity');
  });
});
