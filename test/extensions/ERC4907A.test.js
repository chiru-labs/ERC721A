const { deployContract, getBlockTimestamp, mineBlockTimestamp } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc4097a = await deployContract(contract, constructorArgs);
      });

      describe('EIP-165 support', async function () {
        it('supports ERC165', async function () {
          expect(await this.erc4097a.supportsInterface('0x01ffc9a7')).to.eq(true);
        });

        it('supports IERC721', async function () {
          expect(await this.erc4097a.supportsInterface('0x80ac58cd')).to.eq(true);
        });

        it('supports ERC721Metadata', async function () {
          expect(await this.erc4097a.supportsInterface('0x5b5e139f')).to.eq(true);
        });

        it('supports ERC4907', async function () {
          expect(await this.erc4097a.supportsInterface('0xad092b5c')).to.eq(true);
        });

        it('does not support random interface', async function () {
          expect(await this.erc4097a.supportsInterface('0x00000042')).to.eq(false);
        });
      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          
          await this.erc4097a['mint(address,uint256)'](this.owner.address, 1);
          await this.erc4097a['mint(address,uint256)'](this.addr1.address, 2);
          
          this.expires = (await getBlockTimestamp()) + 123;
          this.tokenId = 2;
          this.user = this.owner;
        });

        it('explicitUserOf returns zero address after minting', async function () {
          expect(await this.erc4097a.explicitUserOf(0)).to.equal(ZERO_ADDRESS);
          expect(await this.erc4097a.explicitUserOf(1)).to.equal(ZERO_ADDRESS);
          expect(await this.erc4097a.explicitUserOf(2)).to.equal(ZERO_ADDRESS);
        });

        it('userOf returns zero address after minting', async function () {
          expect(await this.erc4097a.userOf(0)).to.equal(ZERO_ADDRESS);
          expect(await this.erc4097a.userOf(1)).to.equal(ZERO_ADDRESS);
          expect(await this.erc4097a.userOf(2)).to.equal(ZERO_ADDRESS);
        });

        it('userExpires returns zero timestamp after minting', async function () {
          expect(await this.erc4097a.userExpires(0)).to.equal(0);
          expect(await this.erc4097a.userExpires(1)).to.equal(0);
          expect(await this.erc4097a.userExpires(2)).to.equal(0);
        });

        describe('setUser', async function () {
          beforeEach(async function () {
            this.setUser = async () => await this.erc4097a.connect(this.addr1)
              .setUser(this.tokenId, this.user.address, this.expires);
            
            this.setupAuthTest = async () => {
              this.tokenId = 0;
              await expect(this.setUser()).to.be.revertedWith('SetUserCallerNotOwnerNorApproved');
            };
          });

          it('correctly changes the return value of explicitUserOf', async function () {
            await this.setUser();
            expect(await this.erc4097a.explicitUserOf(this.tokenId)).to.equal(this.user.address);
          });

          it('correctly changes the return value of userOf', async function () {
            await this.setUser();
            expect(await this.erc4097a.userOf(this.tokenId)).to.equal(this.user.address);
          });

          it('correctly changes the return value of expires', async function () {
            await this.setUser();
            expect(await this.erc4097a.userExpires(this.tokenId)).to.equal(this.expires);
          });

          it('emits the UpdateUser event properly', async function () {
            await expect(await this.setUser())
              .to.emit(this.erc4097a, 'UpdateUser')
              .withArgs(this.tokenId, this.user.address, this.expires);
          });
          
          it('reverts for an invalid token', async function () {
            this.tokenId = 123;
            await expect(this.setUser()).to.be.revertedWith('OwnerQueryForNonexistentToken');
          });

          it('requires token ownership', async function () {
            await this.setupAuthTest();
            await this.erc4097a.transferFrom(this.owner.address, this.addr1.address, this.tokenId);
            await this.setUser();
          });
          
          it('requires token approval', async function () {
            await this.setupAuthTest();
            await this.erc4097a.approve(this.addr1.address, this.tokenId);
            await this.setUser();
          });

          it('requires operator approval', async function () {
            await this.setupAuthTest();
            await this.erc4097a.setApprovalForAll(this.addr1.address, 1);
            await this.setUser();
          });          
        });
        
        describe('after expiry', async function () {
          beforeEach(async function () {
            await this.erc4097a.connect(this.addr1)
              .setUser(this.tokenId, this.user.address, this.expires);
          });

          it('userOf returns zero address after expires', async function () {
            expect(await this.erc4097a.userOf(this.tokenId)).to.equal(this.user.address);
            await mineBlockTimestamp(this.expires);
            expect(await this.erc4097a.userOf(this.tokenId)).to.equal(this.user.address);
            await mineBlockTimestamp(this.expires + 1);
            expect(await this.erc4097a.userOf(this.tokenId)).to.equal(ZERO_ADDRESS);
          });

          it('explicitUserOf returns correct address after expiry', async function () {
            expect(await this.erc4097a.explicitUserOf(this.tokenId)).to.equal(this.user.address);
            await mineBlockTimestamp(this.expires);
            expect(await this.erc4097a.explicitUserOf(this.tokenId)).to.equal(this.user.address);
            await mineBlockTimestamp(this.expires + 1);
            expect(await this.erc4097a.explicitUserOf(this.tokenId)).to.equal(this.user.address);
          });
        });
      });
    });
  };

describe(
  'ERC4907A',
  createTestSuite({
    contract: 'ERC4907AMock',
    constructorArgs: ['Azuki', 'AZUKI'],
  })
);
