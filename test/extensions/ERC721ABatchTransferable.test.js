const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aBatchTransferable = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aBatchTransferable.startTokenId
          ? (await this.erc721aBatchTransferable.startTokenId()).toNumber()
          : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
        offsetted(0);
      });

      beforeEach(async function () {
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        this.owner = owner;
        this.addr1 = addr1;
        this.addr2 = addr2;
        this.addr3 = addr3;
        this.addr4 = addr4;
        this.numTotalTokens = 20;
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr2.address, 2);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr1.address, 1);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr2.address, 1);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr1.address, 2);
        await this.erc721aBatchTransferable['safeMint(address,uint256)'](this.addr2.address, 14);

        this.addr1.expected = {
          mintCount: 3,
          tokens: offsetted(2, 4, 5),
        };

        this.addr2.expected = {
          mintCount: 17,
          tokens: offsetted(0, 17, 1, 6, 7, 13, 19, 10, 12, 11, 8, 14, 15, 16, 3, 18, 9),
        };
      });

      context('test batch transfer functionality', function () {
        const testSuccessfulBatchTransfer = function (transferFn, transferToContract = true) {
          beforeEach(async function () {
            const sender = this.addr2;
            this.tokenIds = this.addr2.expected.tokens;
            this.from = sender.address;
            this.to = transferToContract ? this.addr3 : this.addr4;
            await this.erc721aBatchTransferable.connect(sender).approve(this.to.address, this.tokenIds[0]);

            const ownershipBefore = await this.erc721aBatchTransferable.getOwnershipAt(this.tokenIds[0]);
            this.timestampBefore = parseInt(ownershipBefore.startTimestamp);
            this.timestampToMine = (await getBlockTimestamp()) + 12345;
            await mineBlockTimestamp(this.timestampToMine);
            this.timestampMined = await getBlockTimestamp();

            // prettier-ignore
            this.transferTx = await this.erc721aBatchTransferable
            .connect(sender)[transferFn](this.from, this.to.address, this.tokenIds);

            const ownershipAfter = await this.erc721aBatchTransferable.getOwnershipAt(this.tokenIds[0]);
            this.timestampAfter = parseInt(ownershipAfter.startTimestamp);
          });

          it('transfers the ownership of the given token IDs to the given address', async function () {
            for (let i = 0; i < this.tokenIds.length; i++) {
              const tokenId = this.tokenIds[i];
              expect(await this.erc721aBatchTransferable.ownerOf(tokenId)).to.be.equal(this.to.address);
            }
          });

          it('emits Transfers event', async function () {
            for (let i = 0; i < this.tokenIds.length; i++) {
              const tokenId = this.tokenIds[i];
              await expect(this.transferTx)
                .to.emit(this.erc721aBatchTransferable, 'Transfer')
                .withArgs(this.from, this.to.address, tokenId);
            }
          });

          it('clears the approval for the token ID', async function () {
            expect(await this.erc721aBatchTransferable.getApproved(this.tokenIds[0])).to.be.equal(ZERO_ADDRESS);
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
