const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const RECEIVER_MAGIC_VALUE = '0x150b7a02';

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aBatchTransferable = await deployContract(contract, constructorArgs);
        this.receiver = await deployContract('ERC721ReceiverMock', [
          RECEIVER_MAGIC_VALUE,
          this.erc721aBatchTransferable.address,
        ]);
        this.startTokenId = this.erc721aBatchTransferable.startTokenId
          ? (await this.erc721aBatchTransferable.startTokenId()).toNumber()
          : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
        offsetted(0);
      });

      beforeEach(async function () {
        const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
        this.owner = owner;
        this.addr1 = addr1;
        this.addr2 = addr2;
        this.addr3 = addr3;
        this.addr4 = addr4;
        this.addr5 = addr5;

        this.addr1.expected = {
          mintCount: 3,
          tokens: offsetted(2, 4, 5),
        };

        this.addr2.expected = {
          mintCount: 20,
          tokens: offsetted(0, 1, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22),
        };

        this.addr3.expected = {
          mintCount: 7,
          tokens: offsetted(23, 24, 25, 26, 27, 28, 29),
        };

        this.numTotalTokens =
          this.addr1.expected.mintCount + this.addr2.expected.mintCount + this.addr3.expected.mintCount;

        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr2.address, 2);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr1.address, 1);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr2.address, 1);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr1.address, 2);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr2.address, 17);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr3.address, 7);
      });

      it('test safe batch transfer with data', async function () {
        const transferFn = 'safeBatchTransferFrom(address,address,uint256[],bytes)';
        const tokensToTransfer = this.addr1.expected.tokens;
        await expect(this.erc721aBatchTransferable.connect(this.addr1)[transferFn](
          this.addr1.address, this.receiver.address, tokensToTransfer, '0x01'
        )).to.be.revertedWith('reverted in the receiver contract!');
      });

      it('batch transfer nothing', async function () {
        const transferFn = 'safeBatchTransferFrom(address,address,uint256[])';
        await this.erc721aBatchTransferable.connect(this.addr1)[transferFn](
          this.addr1.address, this.receiver.address, []);
      });

      context('test batch transfer functionality', function () {
        const testSuccessfulBatchTransfer = function (transferFn, transferToContract = true) {
          describe('successful transfers', async function () {
            beforeEach(async function () {
              const sender = this.addr2;
              this.tokenIds = this.addr2.expected.tokens;
              this.from = sender.address;
              this.to = transferToContract ? this.receiver : this.addr4;
              this.approvedIds = [this.tokenIds[2], this.tokenIds[3]];
              this.initializedToken = 8;
              this.uninitializedToken = 10;

              this.approvedIds.forEach(async (tokenId) => {
                await this.erc721aBatchTransferable.connect(sender).approve(this.to.address, tokenId);
              });

              // Manually initialize `this.initializedToken`
              await this.erc721aBatchTransferable.initializeOwnershipAt(this.initializedToken);

              const ownershipBefore = await this.erc721aBatchTransferable.getOwnershipAt(3);
              this.timestampBefore = parseInt(ownershipBefore.startTimestamp);
              this.timestampToMine = (await getBlockTimestamp()) + 12345;
              await mineBlockTimestamp(this.timestampToMine);
              this.timestampMined = await getBlockTimestamp();

              this.transferTx = await this.erc721aBatchTransferable
              .connect(sender)[transferFn](this.from, this.to.address, this.tokenIds);

              const ownershipAfter = await this.erc721aBatchTransferable.getOwnershipAt(3);
              this.timestampAfter = parseInt(ownershipAfter.startTimestamp);

              // Transfer part of uninitialized tokens
              this.tokensToTransferAlt = [25, 26, 27];
              this.transferTxAlt = await this.erc721aBatchTransferable.connect(this.addr3)[transferFn](
                this.addr3.address, this.addr5.address, this.tokensToTransferAlt
              );
            });

            it('emits Transfers event', async function () {
              for (let i = 0; i < this.tokenIds.length; i++) {
                const tokenId = this.tokenIds[i];
                await expect(this.transferTx)
                  .to.emit(this.erc721aBatchTransferable, 'Transfer')
                  .withArgs(this.from, this.to.address, tokenId);
              }
            });

            it('adjusts owners balances', async function () {
              expect(await this.erc721aBatchTransferable.balanceOf(this.from)).to.be.equal(0);
              expect(await this.erc721aBatchTransferable.balanceOf(this.to.address)).to.be.equal(
                this.addr2.expected.mintCount
              );
              expect(await this.erc721aBatchTransferable.balanceOf(this.addr3.address)).to.be.equal(
                this.addr3.expected.tokens.length - this.tokensToTransferAlt.length
              );
              expect(await this.erc721aBatchTransferable.balanceOf(this.addr5.address)).to.be.equal(
                this.tokensToTransferAlt.length
              );
            });

            it('clears the approval for the token IDs', async function () {
              this.approvedIds.forEach(async (tokenId) => {
                expect(await this.erc721aBatchTransferable.getApproved(tokenId)).to.be.equal(ZERO_ADDRESS);
              });
            });

            it('startTimestamp updated correctly', async function () {
              expect(this.timestampBefore).to.be.lt(this.timestampToMine);
              expect(this.timestampAfter).to.be.gte(this.timestampToMine);
              expect(this.timestampAfter).to.be.lt(this.timestampToMine + 10);
              expect(this.timestampToMine).to.be.eq(this.timestampMined);
            });

            it('with transfer of the given token IDs to the given address', async function () {
              for (let i = 0; i < this.tokenIds.length; i++) {
                const tokenId = this.tokenIds[i];
                expect(await this.erc721aBatchTransferable.ownerOf(tokenId)).to.be.equal(this.to.address);
              }

              // Initialized tokens were updated
              expect((await this.erc721aBatchTransferable.getOwnershipAt(3))[0]).to.be.equal(this.to.address);

              // Uninitialized tokens are left uninitialized
              expect((await this.erc721aBatchTransferable.getOwnershipAt(7))[0]).to.be.equal(
                transferFn !== 'batchTransferFromUnoptimized' ? ZERO_ADDRESS : this.to.address
              );

              // Other tokens in between are left unchanged
              for (let i = 0; i < this.addr1.expected.tokens.length; i++) {
                const tokenId = this.addr1.expected.tokens[i];
                expect(await this.erc721aBatchTransferable.ownerOf(tokenId)).to.be.equal(this.addr1.address);
              }
            });

            it('with transfers of uninitialized token IDs to the given address', async function () {
              const allTokensInitiallyOwned = this.addr3.expected.tokens;
              allTokensInitiallyOwned.splice(2, this.tokensToTransferAlt.length);

              for (let i = 0; i < this.tokensToTransferAlt.length; i++) {
                const tokenId = this.tokensToTransferAlt[i];
                expect(await this.erc721aBatchTransferable.ownerOf(tokenId)).to.be.equal(this.addr5.address);
              }

              for (let i = 0; i < allTokensInitiallyOwned.length; i++) {
                const tokenId = allTokensInitiallyOwned[i];
                expect(await this.erc721aBatchTransferable.ownerOf(tokenId)).to.be.equal(this.addr3.address);
              }

              // Ownership of tokens was updated
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.tokensToTransferAlt[0]))[0]).to.be.equal(
                this.addr5.address
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(allTokensInitiallyOwned[2]))[0]).to.be.equal(
                this.addr3.address
              );

              // Uninitialized tokens are left uninitialized
              expect(
                (await this.erc721aBatchTransferable.getOwnershipAt(this.tokensToTransferAlt[0] - 1))[0]
              ).to.be.equal(ZERO_ADDRESS);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(allTokensInitiallyOwned[3]))[0]).to.be.equal(
                ZERO_ADDRESS
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.tokensToTransferAlt[1]))[0]).to.be.equal(
                transferFn !== 'batchTransferFromUnoptimized' ? ZERO_ADDRESS : this.addr5.address
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.tokensToTransferAlt[2]))[0]).to.be.equal(
                transferFn !== 'batchTransferFromUnoptimized' ? ZERO_ADDRESS : this.addr5.address
              );
            });
          });

          describe('ownership correctly set', async function () {
            beforeEach(async function () {
              const sender = this.addr2;
              this.from = sender.address;
              this.to = transferToContract ? this.receiver : this.addr4;
              this.initializedToken = 8;
              this.uninitializedToken = 10;

              // Manually initialize some tokens of addr2
              await this.erc721aBatchTransferable.initializeOwnershipAt(this.initializedToken);
            });

            it('with tokens transferred and cleared', async function () {
              const initializedToken = 15;

              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken - 1))[0]).to.be.equal(
                ZERO_ADDRESS
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken))[0]).to.be.equal(
                ZERO_ADDRESS
              );

              // Initialize token
              await this.erc721aBatchTransferable.initializeOwnershipAt(initializedToken);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken - 1))[0]).to.be.equal(
                ZERO_ADDRESS
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken))[0]).to.be.equal(
                this.addr2.address
              );

              // Transfer tokens
              await this.erc721aBatchTransferable
                .connect(this.addr2)[transferFn](
                  this.from, this.to.address, [initializedToken - 1, initializedToken]
                );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken - 1))[0]).to.be.equal(
                this.to.address
              );
            });

            it('with tokens transferred and updated', async function () {
              const initializedToken = 15;
              const extraData = 123;

              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken - 1))[0]).to.be.equal(
                ZERO_ADDRESS
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken))[0]).to.be.equal(
                ZERO_ADDRESS
              );

              // Initialize token
              await this.erc721aBatchTransferable.initializeOwnershipAt(initializedToken);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken - 1))[0]).to.be.equal(
                ZERO_ADDRESS
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken))[0]).to.be.equal(
                this.addr2.address
              );

              // Set extra data
              await this.erc721aBatchTransferable.setExtraDataAt(initializedToken, extraData);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken))[3]).to.be.equal(extraData);

              // Transfer tokens
              await this.erc721aBatchTransferable
                .connect(this.addr2)[transferFn](
                  this.from, this.to.address, [initializedToken - 1, initializedToken]
                );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken - 1))[0]).to.be.equal(
                this.to.address
              );

              // Initialized tokens in a consecutive transfer are updated when nextData is not 0
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken))[0]).to.be.equal(
                this.to.address
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(initializedToken))[3]).to.be.equal(extraData);
            });

            it('with first token transferred', async function () {
              expect(await this.erc721aBatchTransferable.ownerOf(0)).to.be.equal(this.from);
              expect(await this.erc721aBatchTransferable.ownerOf(1)).to.be.equal(this.from);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(0))[0]).to.be.equal(this.from);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(1))[0]).to.be.equal(ZERO_ADDRESS);

              await this.erc721aBatchTransferable
                  .connect(this.addr2)[transferFn](this.from, this.to.address, [0]);

              expect(await this.erc721aBatchTransferable.ownerOf(0)).to.be.equal(this.to.address);
              expect(await this.erc721aBatchTransferable.ownerOf(1)).to.be.equal(this.from);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(0))[0]).to.be.equal(this.to.address);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(1))[0]).to.be.equal(this.from);
            });

            it('with last token transferred', async function () {
              await expect(this.erc721aBatchTransferable.ownerOf(this.numTotalTokens)).to.be.revertedWith(
                'OwnerQueryForNonexistentToken'
              );

              await this.erc721aBatchTransferable
                .connect(this.addr3)[transferFn](
                  this.addr3.address, this.to.address, [offsetted(this.numTotalTokens - 1
                    )]);

              expect(await this.erc721aBatchTransferable.ownerOf(offsetted(this.numTotalTokens - 1))).to.be.equal(
                this.to.address
              );
              await expect(this.erc721aBatchTransferable.ownerOf(this.numTotalTokens)).to.be.revertedWith(
                'OwnerQueryForNonexistentToken'
              );
            });

            it('with initialized token transferred', async function () {
              expect(await this.erc721aBatchTransferable.ownerOf(this.initializedToken)).to.be.equal(this.from);
              expect(await this.erc721aBatchTransferable.ownerOf(this.initializedToken + 1)).to.be.equal(this.from);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.initializedToken))[0]).to.be.equal(
                this.from
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.initializedToken + 1))[0]).to.be.equal(
                ZERO_ADDRESS
              );

              await this.erc721aBatchTransferable
                  .connect(this.addr2)[transferFn](this.from, this.to.address, [this.initializedToken]);

              expect(await this.erc721aBatchTransferable.ownerOf(this.initializedToken)).to.be.equal(this.to.address);
              expect(await this.erc721aBatchTransferable.ownerOf(this.initializedToken + 1)).to.be.equal(this.from);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.initializedToken))[0]).to.be.equal(
                this.to.address
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.initializedToken + 1))[0]).to.be.equal(
                this.from
              );
            });

            it('with uninitialized token transferred', async function () {
              expect(await this.erc721aBatchTransferable.ownerOf(this.uninitializedToken)).to.be.equal(this.from);
              expect(await this.erc721aBatchTransferable.ownerOf(this.uninitializedToken + 1)).to.be.equal(this.from);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.uninitializedToken))[0]).to.be.equal(
                ZERO_ADDRESS
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.uninitializedToken + 1))[0]).to.be.equal(
                ZERO_ADDRESS
              );

              await this.erc721aBatchTransferable
                  .connect(this.addr2)[transferFn](this.from, this.to.address, [this.uninitializedToken]);

              expect(await this.erc721aBatchTransferable.ownerOf(this.uninitializedToken)).to.be.equal(this.to.address);
              expect(await this.erc721aBatchTransferable.ownerOf(this.uninitializedToken + 1)).to.be.equal(this.from);
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.uninitializedToken))[0]).to.be.equal(
                this.to.address
              );
              expect((await this.erc721aBatchTransferable.getOwnershipAt(this.uninitializedToken + 1))[0]).to.be.equal(
                this.from
              );
            });
          });
        };

        const testUnsuccessfulBatchTransfer = function (transferFn) {
          describe('unsuccessful transfers', function () {
            beforeEach(function () {
              this.tokenIds = this.addr2.expected.tokens.slice(0, 2);
              this.sender = this.addr1;
            });

            it('rejects unapproved transfer', async function () {
              await expect(
                this.erc721aBatchTransferable
                  .connect(this.sender)[transferFn](
                    this.addr2.address, this.sender.address, this.tokenIds
                  )
              ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
            });

            it('rejects transfer from incorrect owner', async function () {
              await this.erc721aBatchTransferable.connect(this.addr2).setApprovalForAll(this.sender.address, true);
              await expect(
                this.erc721aBatchTransferable
                  .connect(this.sender)[transferFn](
                    this.addr3.address, this.sender.address, this.tokenIds
                  )
              ).to.be.revertedWith('TransferFromIncorrectOwner');
            });

            it('rejects transfer from zero address', async function () {
              await this.erc721aBatchTransferable.connect(this.addr2).setApprovalForAll(this.sender.address, true);
              await expect(
                this.erc721aBatchTransferable
                .connect(this.sender)['directBatchTransferFrom(address,address,address,uint256[])'](
                  ZERO_ADDRESS, ZERO_ADDRESS, this.sender.address, this.tokenIds
                )
              ).to.be.revertedWith('TransferFromIncorrectOwner');
              this.erc721aBatchTransferable
              .connect(this.sender)['directBatchTransferFrom(address,address,address,uint256[])'](
                ZERO_ADDRESS, this.addr2.address, this.sender.address, this.tokenIds
              );
              this.erc721aBatchTransferable
              .connect(this.addr2)['directBatchTransferFrom(address,address,uint256[])'](
                this.sender.address, this.addr2.address, this.tokenIds
              );
            });

            it('rejects transfer to zero address', async function () {
              await this.erc721aBatchTransferable.connect(this.addr2).setApprovalForAll(this.sender.address, true);
              await expect(
              this.erc721aBatchTransferable
                .connect(this.sender)[transferFn](
                  this.addr2.address, ZERO_ADDRESS, this.tokenIds
                )
            ).to.be.revertedWith('TransferToZeroAddress');
            });
          });
        };

        const testApproveBatchTransfer = function (transferFn) {
          describe('approvals correctly set', async function () {
            beforeEach(function () {
              this.tokenIds = this.addr1.expected.tokens.slice(0, 2);
            });

            it('approval allows batch transfers', async function () {
              await expect(
              this.erc721aBatchTransferable
                .connect(this.addr3)[transferFn](
                  this.addr1.address, this.addr3.address, this.tokenIds
                )
            ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');

              for (let i = 0; i < this.tokenIds.length; i++) {
                const tokenId = this.tokenIds[i];
                await this.erc721aBatchTransferable.connect(this.addr1).approve(this.addr3.address, tokenId);
              }

              await this.erc721aBatchTransferable
              .connect(this.addr3)[transferFn](
                this.addr1.address, this.addr3.address, this.tokenIds
              );
              await expect(
              this.erc721aBatchTransferable
                .connect(this.addr1)[transferFn](
                  this.addr3.address, this.addr1.address, this.tokenIds
                )
            ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
            });

            it('self-approval is cleared on batch transfers', async function () {
              for (let i = 0; i < this.tokenIds.length; i++) {
                const tokenId = this.tokenIds[i];
                await this.erc721aBatchTransferable.connect(this.addr1).approve(this.addr1.address, tokenId);
                expect(await this.erc721aBatchTransferable.getApproved(tokenId)).to.equal(this.addr1.address);
              }

              await this.erc721aBatchTransferable
            .connect(this.addr1)[transferFn](
              this.addr1.address, this.addr2.address, this.tokenIds
              );
              for (let i = 0; i < this.tokenIds.length; i++) {
                const tokenId = this.tokenIds[i];
                expect(await this.erc721aBatchTransferable.getApproved(tokenId)).to.not.equal(this.addr1.address);
              }
            });

            it('approval for all allows batch transfers', async function () {
              await this.erc721aBatchTransferable.connect(this.addr1).setApprovalForAll(this.addr3.address, true);

              await this.erc721aBatchTransferable
              .connect(this.addr3)[transferFn](
                this.addr1.address, this.addr3.address, this.tokenIds
              );
            });
          });
        };

        context('successful transfers', function () {
          context('batchTransferFrom', function (fn = 'batchTransferFrom') {
            describe('to contract', function () {
              testSuccessfulBatchTransfer(fn);
              testUnsuccessfulBatchTransfer(fn);
              testApproveBatchTransfer(fn);
            });

            describe('to EOA', function () {
              testSuccessfulBatchTransfer(fn, false);
              testUnsuccessfulBatchTransfer(fn, false);
              testApproveBatchTransfer(fn, false);
            });
          });
          
          context('safeBatchTransferFrom', function (fn = 'safeBatchTransferFrom(address,address,uint256[])') {
            describe('to contract', function () {
              testSuccessfulBatchTransfer(fn);
              testUnsuccessfulBatchTransfer(fn);
              testApproveBatchTransfer(fn);
            });

            describe('to EOA', function () {
              testSuccessfulBatchTransfer(fn, false);
              testUnsuccessfulBatchTransfer(fn, false);
              testApproveBatchTransfer(fn, false);
            });
          });

          // Use to compare gas usage and verify expected behaviour with respect to normal transfers
          context('batchTransferFromUnoptimized', function (fn = 'batchTransferFromUnoptimized') {
            describe('to contract', function () {
              testSuccessfulBatchTransfer(fn);
              testUnsuccessfulBatchTransfer(fn);
              testApproveBatchTransfer(fn);
            });

            describe('to EOA', function () {
              testSuccessfulBatchTransfer(fn, false);
              testUnsuccessfulBatchTransfer(fn, false);
              testApproveBatchTransfer(fn, false);
            });
          });
        });
      });
    });
  };

describe(
  'ERC721ABatchTransferable',
  createTestSuite({ contract: 'ERC721ABatchTransferableMock', constructorArgs: ['Azuki', 'AZUKI'] })
);
