const { deployContract } = require('../helpers.js');
const { expect } = require('chai');

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721aLowCap = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721aLowCap.startTokenId
          ? (await this.erc721aLowCap.startTokenId()).toNumber()
          : 0;
      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
          this.addr3 = addr3;
          this.addr4 = addr4;
          await this.erc721aLowCap['safeMint(address,uint256)'](addr1.address, 1);
          await this.erc721aLowCap['safeMint(address,uint256)'](addr2.address, 2);
          await this.erc721aLowCap['safeMint(address,uint256)'](addr3.address, 3);
        });

        describe('tokensOfOwner', async function () {
          it('returns the correct token ids', async function () {
            const expected_results = [
              // Address 1 -- Single token
              { owner: this.addr1, tokens: [this.startTokenId] },
              // Address 3 -- Multiple tokens
              { owner: this.addr3, tokens: [this.startTokenId + 3, this.startTokenId + 4, this.startTokenId + 5] },
              // Address 4 -- No tokens
              { owner: this.addr4, tokens: [] },
            ];

            for (const expected_result of expected_results) {
              const bn_tokens = await this.erc721aLowCap['tokensOfOwner(address)'](expected_result.owner.address);
              expect(bn_tokens.map((bn) => bn.toNumber())).to.eql(expected_result.tokens);
            }
          });

          it('returns the correct token ids after a transfer interferes with the normal logic', async function () {
            await this.erc721aLowCap['safeMint(address,uint256)'](this.owner.address, 3);

            // Break sequential order
            await this.erc721aLowCap['transferFrom(address,address,uint256)'](this.owner.address, this.addr4.address, this.startTokenId + 7);

            // Load balances
            const owner_bn_tokens = await this.erc721aLowCap['tokensOfOwner(address)'](this.owner.address);
            const addr4_bn_tokens = await this.erc721aLowCap['tokensOfOwner(address)'](this.addr4.address);

            // Verify the function can still read the correct token ids
            expect(owner_bn_tokens.map((bn) => bn.toNumber())).to.eql([ this.startTokenId + 6, this.startTokenId + 8]);
            expect(addr4_bn_tokens.map((bn) => bn.toNumber())).to.eql([ this.startTokenId + 7]);
          });
        });
      });
  });
};

describe('ERC721ALowCap', createTestSuite({ contract: 'ERC721ALowCapMock', constructorArgs: ['Azuki', 'AZUKI'] }));

describe(
  'ERC721ALowCap override _startTokenId()',
  createTestSuite({ contract: 'ERC721ALowCapStartTokenIdMock', constructorArgs: ['Azuki', 'AZUKI', 1] })
);
