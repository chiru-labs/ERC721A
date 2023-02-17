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
          });

          it('transfers the ownership of uninitialized token IDs to the given address', async function () {
            const allTokensInitiallyOwned = this.addr3.expected.tokens;
            allTokensInitiallyOwned.splice(2, 3);

            for (let i = 0; i < this.tokensToTransferAlt.length; i++) {
              const tokenId = this.tokensToTransferAlt[i];
              expect(await this.erc721aBatchTransferable.ownerOf(tokenId)).to.be.equal(this.addr5.address);
            }

            for (let i = 0; i < allTokensInitiallyOwned.length; i++) {
              const tokenId = allTokensInitiallyOwned[i];
              expect(await this.erc721aBatchTransferable.ownerOf(tokenId)).to.be.equal(this.addr3.address);
            }

            expect(await this.erc721aBatchTransferable.balanceOf(this.addr5.address)).to.be.equal(
              this.tokensToTransferAlt.length
            );
            expect(await this.erc721aBatchTransferable.balanceOf(this.addr3.address)).to.be.equal(
              allTokensInitiallyOwned.length
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
          });

          it('startTimestamp updated correctly', async function () {
            expect(this.timestampBefore).to.be.lt(this.timestampToMine);
            expect(this.timestampAfter).to.be.gte(this.timestampToMine);
            expect(this.timestampAfter).to.be.lt(this.timestampToMine + 10);
            expect(this.timestampToMine).to.be.eq(this.timestampMined);
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
      });
    });
  };

describe(
  'ERC721ABatchTransferable',
  createTestSuite({ contract: 'ERC721ABatchTransferableMock', constructorArgs: ['Azuki', 'AZUKI'] })
);
