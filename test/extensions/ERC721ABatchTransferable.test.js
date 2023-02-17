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
        this.numTotalTokens = 30;

        this.addr1.expected = {
          mintCount: 3,
          tokens: offsetted(2, 4, 5),
        };

        this.addr2.expected = {
          mintCount: 20,
          tokens: offsetted(0, 17, 1, 6, 7, 21, 13, 19, 10, 12, 11, 8, 20, 14, 15, 16, 3, 18, 22, 9),
        };

        this.addr3.expected = {
          mintCount: 7,
          tokens: offsetted(23, 24, 25, 26, 27, 28, 29),
        };

        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr2.address, 2);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr1.address, 1);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr2.address, 1);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr1.address, 2);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr2.address, 17);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr3.address, 7);
      });

      context('test batch transfer functionality', function () {
        const testSuccessfulBatchTransfer = function (transferFn, transferToContract = true) {
          beforeEach(async function () {
            const sender = this.addr2;
            this.tokenIds = this.addr2.expected.tokens;
            this.from = sender.address;
            this.to = transferToContract ? this.receiver : this.addr4;
            this.approvedIds = [this.tokenIds[0], this.tokenIds[2], this.tokenIds[3]];

            this.approvedIds.forEach(async (tokenId) => {
              await this.erc721aBatchTransferable.connect(sender).approve(this.to.address, tokenId);
            });

            const ownershipBefore = await this.erc721aBatchTransferable.getOwnershipAt(this.tokenIds[0]);
            this.timestampBefore = parseInt(ownershipBefore.startTimestamp);
            this.timestampToMine = (await getBlockTimestamp()) + 12345;
            await mineBlockTimestamp(this.timestampToMine);
            this.timestampMined = await getBlockTimestamp();

            // Manually initialize some tokens of addr2
            await this.erc721aBatchTransferable.initializeOwnershipAt(3);
            await this.erc721aBatchTransferable.initializeOwnershipAt(8);

            // prettier-ignore
            this.transferTx = await this.erc721aBatchTransferable
              .connect(sender)[transferFn](this.from, this.to.address, this.tokenIds);

            // Transfer part of uninitialized tokens
            this.tokensToTransferAlt = [25, 26, 27];
            // prettier-ignore
            this.transferTxAlt = await this.erc721aBatchTransferable.connect(this.addr3)[transferFn](
              this.addr3.address, this.addr5.address, this.tokensToTransferAlt
            );

            const ownershipAfter = await this.erc721aBatchTransferable.getOwnershipAt(this.tokenIds[0]);
            this.timestampAfter = parseInt(ownershipAfter.startTimestamp);
          });

          it('transfers the ownership of the given token IDs to the given address', async function () {
            for (let i = 0; i < this.tokenIds.length; i++) {
              const tokenId = this.tokenIds[i];
              expect(await this.erc721aBatchTransferable.ownerOf(tokenId)).to.be.equal(this.to.address);
            }

            // Initialized tokens were updated
            expect((await this.erc721aBatchTransferable.getOwnershipAt(3))[0]).to.be.equal(this.to.address);
            expect((await this.erc721aBatchTransferable.getOwnershipAt(8))[0]).to.be.equal(this.to.address);

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

          it('transfers the ownership of uninitialized token IDs to the given address', async function () {
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

          it('emits Transfers event', async function () {
            for (let i = 0; i < this.tokenIds.length; i++) {
              const tokenId = this.tokenIds[i];
              await expect(this.transferTx)
                .to.emit(this.erc721aBatchTransferable, 'Transfer')
                .withArgs(this.from, this.to.address, tokenId);
            }
          });

          it('clears the approval for the token IDs', async function () {
            this.approvedIds.forEach(async (tokenId) => {
              expect(await this.erc721aBatchTransferable.getApproved(tokenId)).to.be.equal(ZERO_ADDRESS);
            });
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

          it('startTimestamp updated correctly', async function () {
            expect(this.timestampBefore).to.be.lt(this.timestampToMine);
            expect(this.timestampAfter).to.be.gte(this.timestampToMine);
            expect(this.timestampAfter).to.be.lt(this.timestampToMine + 10);
            expect(this.timestampToMine).to.be.eq(this.timestampMined);
          });
        };

        const testUnsuccessfulBatchTransfer = function (transferFn) {
          beforeEach(function () {
            this.tokenIds = this.addr2.expected.tokens.slice(0, 2);
            this.sender = this.addr1;
          });

          it('rejects unapproved transfer', async function () {
            // prettier-ignore
            await expect(
              this.erc721aBatchTransferable
                .connect(this.sender)[transferFn](
                  this.addr2.address, this.sender.address, this.tokenIds
                )
            ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
          });

          it('rejects transfer from incorrect owner', async function () {
            await this.erc721aBatchTransferable.connect(this.addr2).setApprovalForAll(this.sender.address, true);
            // prettier-ignore
            await expect(
              this.erc721aBatchTransferable
                .connect(this.sender)[transferFn](
                  this.addr3.address, this.sender.address, this.tokenIds
                )
            ).to.be.revertedWith('TransferFromIncorrectOwner');
          });

          it('rejects transfer to zero address', async function () {
            await this.erc721aBatchTransferable.connect(this.addr2).setApprovalForAll(this.sender.address, true);
            // prettier-ignore
            await expect(
              this.erc721aBatchTransferable
                .connect(this.sender)[transferFn](
                  this.addr2.address, ZERO_ADDRESS, this.tokenIds
                )
            ).to.be.revertedWith('TransferToZeroAddress');
          });
        };

        const testApproveBatchTransfer = function (transferFn) {
          beforeEach(function () {
            this.tokenIds = this.addr1.expected.tokens.slice(0, 2);
          });

          it('approval allows batch transfers', async function () {
            // prettier-ignore
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

            // prettier-ignore
            await this.erc721aBatchTransferable
              .connect(this.addr3)[transferFn](
                this.addr1.address, this.addr3.address, this.tokenIds
              );
            // prettier-ignore
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

            // prettier-ignore
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

            // prettier-ignore
            await this.erc721aBatchTransferable
              .connect(this.addr3)[transferFn](
                this.addr1.address, this.addr3.address, this.tokenIds
              );
          });
        };

        context('successful transfers', function () {
          context('batchTransferFrom', function () {
            describe('to contract', function () {
              testSuccessfulBatchTransfer('batchTransferFrom');
            });

            describe('to EOA', function () {
              testSuccessfulBatchTransfer('batchTransferFrom', false);
            });
          });
          context('safeBatchTransferFrom', function () {
            describe('to contract', function () {
              testSuccessfulBatchTransfer('safeBatchTransferFrom(address,address,uint256[])');
            });

            describe('to EOA', function () {
              testSuccessfulBatchTransfer('safeBatchTransferFrom(address,address,uint256[])', false);
            });
          });

          // TEMPORARY: to use as comparison for gas usage
          context('batchTransferFromUnoptimized', function () {
            describe('to contract', function () {
              testSuccessfulBatchTransfer('batchTransferFromUnoptimized');
            });

            describe('to EOA', function () {
              testSuccessfulBatchTransfer('batchTransferFromUnoptimized', false);
            });
          });
        });

        context('unsuccessful transfers', function () {
          context('batchTransferFrom', function () {
            describe('to contract', function () {
              testUnsuccessfulBatchTransfer('batchTransferFrom');
            });

            describe('to EOA', function () {
              testUnsuccessfulBatchTransfer('batchTransferFrom', false);
            });
          });
          context('safeBatchTransferFrom', function () {
            describe('to contract', function () {
              testUnsuccessfulBatchTransfer('safeBatchTransferFrom(address,address,uint256[])');
            });

            describe('to EOA', function () {
              testUnsuccessfulBatchTransfer('safeBatchTransferFrom(address,address,uint256[])', false);
            });
          });

          // TEMPORARY: to use as comparison for gas usage
          context('batchTransferFromUnoptimized', function () {
            describe('to contract', function () {
              testUnsuccessfulBatchTransfer('batchTransferFromUnoptimized');
            });

            describe('to EOA', function () {
              testUnsuccessfulBatchTransfer('batchTransferFromUnoptimized', false);
            });
          });
        });

        context('approvals', function () {
          context('batchTransferFrom', function () {
            describe('to contract', function () {
              testApproveBatchTransfer('batchTransferFrom');
            });

            describe('to EOA', function () {
              testApproveBatchTransfer('batchTransferFrom', false);
            });
          });
          context('safeBatchTransferFrom', function () {
            describe('to contract', function () {
              testApproveBatchTransfer('safeBatchTransferFrom(address,address,uint256[])');
            });

            describe('to EOA', function () {
              testApproveBatchTransfer('safeBatchTransferFrom(address,address,uint256[])', false);
            });
          });

          // TEMPORARY: to use as comparison for gas usage
          context('batchTransferFromUnoptimized', function () {
            describe('to contract', function () {
              testApproveBatchTransfer('batchTransferFromUnoptimized');
            });

            describe('to EOA', function () {
              testApproveBatchTransfer('batchTransferFromUnoptimized', false);
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
