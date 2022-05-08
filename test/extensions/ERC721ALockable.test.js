const { deployContract } = require('../helpers.js');
const { expect } = require("chai");

describe("ERC721ALockable", function () {

    let accts = [];
    let addrs = [];

    before(async () => {
        accts = await ethers.getSigners();
        for (let i = 0; i < accts.length; i++) {
            addrs.push(accts[i].address);
        }
        this.token = await deployContract('ERC721ALockableMock', ['Azuki', 'AZUKI']);
    });

    it("Mint Token", async () => {
        await this.token.mint(addrs[1], 10);
        expect(await this.token.balanceOf(addrs[1])).to.equal(10);
        await this.token.mint(addrs[2], 10);
        expect(await this.token.balanceOf(addrs[2])).to.equal(10);
        await this.token.mint(addrs[3], 10);
        expect(await this.token.balanceOf(addrs[3])).to.equal(10);
    })

    it("Add Locks", async () => {
        await expect(this.token.addLocks([])).to.be.revertedWith("InvalidParam");
        await expect(this.token.addLocksAndApproveThis([])).to.be.revertedWith("InvalidParam");
        await expect(this.token.addLocks([addrs[1]])).to.be.revertedWith("NotOwner");
        await expect(this.token.connect(accts[1]).addLocks([addrs[1]])).to.be.revertedWith("SelfNotAllow");

        expect(await this.token.connect(accts[1]).addLocks([addrs[10], addrs[11], addrs[12]])).to.be.ok;
        expect(await this.token.isApprovedForAll(addrs[1], this.token.address)).to.equal(false);

        await expect(this.token.connect(accts[1]).addLocksAndApproveThis([addrs[10]])).to.be.revertedWith("LockAdded");

        expect(await this.token.connect(accts[1]).addLocksAndApproveThis([addrs[13]])).to.be.ok;
        expect(await this.token.isApprovedForAll(addrs[1], this.token.address)).to.equal(true);

        await expect(this.token.connect(accts[1]).addLocksAndApproveThis([addrs[14]])).to.emit(this.token, "AddLock").withArgs(addrs[1], addrs[14]);

        await expect(() => this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 0)).to.changeTokenBalances(this.token, [accts[1], accts[2]], [-1, 1]);

        expect(await this.token.getOwnerTokens(addrs[1])).to.eql([]);
        expect(await this.token.getOwnerLocks(addrs[1])).to.eql([addrs[10], addrs[11], addrs[12], addrs[13], addrs[14]]);
        expect(await this.token.getTokenLocks(1)).to.eql([]);
        expect(await this.token.getLockTokens(addrs[10], addrs[1])).to.eql([]);
        expect(await this.token.totalLockTokens()).to.equal(0);
    })

    it("Remove Locks", async () => {
        await expect(this.token.connect(accts[14]).remove(addrs[0])).to.be.revertedWith("NotALock");
        expect(await this.token.connect(accts[14]).remove(addrs[1])).to.be.ok;
        await expect(this.token.connect(accts[14]).remove(addrs[1])).to.be.revertedWith("NotALock");

        await expect(this.token.connect(accts[13]).unlockAllAndRemove(addrs[1])).to.be.revertedWith("NotLocked");
        expect(await this.token.connect(accts[13]).remove(addrs[1])).to.be.ok;

        expect(await this.token.connect(accts[12]).lockId(addrs[1], 1)).to.be.ok;
        await expect(this.token.connect(accts[12]).remove(addrs[1])).to.be.revertedWith("HaveLocks");
        expect(await this.token.connect(accts[12]).unlockId(addrs[1], 1)).to.be.ok;
        expect(await this.token.connect(accts[12]).remove(addrs[1])).to.be.ok;
        await expect(this.token.connect(accts[12]).unlockAllAndRemove(addrs[1])).to.be.revertedWith("NotLocked");

        expect(await this.token.connect(accts[11]).lockId(addrs[1], 1)).to.be.ok;
        expect(await this.token.connect(accts[11]).unlockAllAndRemove(addrs[1])).to.be.ok;
        await expect(this.token.connect(accts[11]).lockId(addrs[1], 1)).to.be.revertedWith("NotALock");
        await expect(this.token.connect(accts[11]).unlockAllAndRemove(addrs[1])).to.be.revertedWith("NotLocked");

        await expect(this.token.connect(accts[10]).remove(addrs[1])).to.emit(this.token, "RemoveLock").withArgs(addrs[10], addrs[1]);

        await expect(() => this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 1)).to.changeTokenBalances(this.token, [accts[1], accts[2]], [-1, 1]);

        expect(await this.token.getOwnerTokens(addrs[1])).to.eql([]);
        expect(await this.token.getOwnerLocks(addrs[1])).to.eql([]);
        expect(await this.token.getTokenLocks(1)).to.eql([]);
        expect(await this.token.getLockTokens(addrs[10], addrs[1])).to.eql([]);
        expect(await this.token.totalLockTokens()).to.equal(0);
    })

    it("Lock Tokens", async () => {
        expect(await this.token.connect(accts[1]).addLocks([addrs[10], addrs[11], addrs[12]]));

        await expect(this.token.connect(accts[9]).lockId(addrs[1], 2)).to.be.revertedWith("NotALock");
        await expect(this.token.connect(accts[10]).lockId(addrs[1], 0)).to.be.revertedWith("NotOwner");
        await expect(this.token.connect(accts[10]).lockId(addrs[1], 100)).to.be.revertedWith("OwnerQueryForNonexistentToken");

        expect(await this.token.connect(accts[10]).lockId(addrs[1], 2)).to.be.ok;
        expect(await this.token.connect(accts[11]).lockId(addrs[1], 2)).to.be.ok;
        expect(await this.token.connect(accts[12]).lockId(addrs[1], 2)).to.be.ok;

        await expect(this.token.connect(accts[10]).lockIds(addrs[1], [2, 3])).to.be.revertedWith("TokenLocked");

        expect(await this.token.connect(accts[10]).lockIds(addrs[1], [3, 4])).to.be.ok;

        await expect(this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 2)).to.be.revertedWith("TokenLocked");
        expect(await this.token.ownerOf(2)).to.equal(addrs[1]);

        expect((await this.token.getOwnerTokens(addrs[1])).length).to.equal(3);
        expect((await this.token.getOwnerLocks(addrs[1])).length).to.equal(3);
        expect(await this.token.getTokenLocks(1)).to.eql([]);
        expect((await this.token.getTokenLocks(2)).length).to.equal(3);
        expect((await this.token.getLockTokens(addrs[10], addrs[1])).length).to.equal(3);
        expect(await this.token.totalLockTokens()).to.equal(3);
    })

    it("Unlock Tokens", async () => {
        await expect(this.token.connect(accts[9]).unlockId(addrs[1], 2)).to.be.revertedWith("NotALock");
        await expect(this.token.connect(accts[10]).unlockId(addrs[1], 100)).to.be.revertedWith("TokenNotExist");
        await expect(this.token.connect(accts[10]).unlockId(addrs[1], 5)).to.be.revertedWith("NotLocked");

        expect(await this.token.connect(accts[10]).unlockId(addrs[1], 2)).to.be.ok;

        expect((await this.token.getTokenLocks(2)).length).to.equal(2);
        await expect(this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 2)).to.be.revertedWith("TokenLocked");

        expect(await this.token.connect(accts[11]).unlockId(addrs[1], 2)).to.be.ok;
        expect(await this.token.connect(accts[12]).unlockId(addrs[1], 2)).to.be.ok;
        expect((await this.token.getTokenLocks(2)).length).to.equal(0);
        expect(await this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 2)).to.be.ok;

        await expect(this.token.connect(accts[11]).unlockId(addrs[1], 3)).to.be.revertedWith("NotLocked");
        await expect(this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 3)).to.be.revertedWith("TokenLocked");
        await expect(this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 4)).to.be.revertedWith("TokenLocked");

        expect(await this.token.connect(accts[10]).unlockAll(addrs[1])).to.be.ok;
        expect(await this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 3)).to.be.ok;
        expect(await this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 4)).to.be.ok;

        await expect(this.token.connect(accts[10]).unlockAll(addrs[1])).to.be.revertedWith("NotLocked");

        expect((await this.token.getOwnerTokens(addrs[1])).length).to.equal(0);
        expect((await this.token.getOwnerLocks(addrs[1])).length).to.equal(3);
        expect(await this.token.getTokenLocks(1)).to.eql([]);
        expect((await this.token.getTokenLocks(2)).length).to.equal(0);
        expect((await this.token.getLockTokens(addrs[10], addrs[1])).length).to.equal(0);
        expect(await this.token.totalLockTokens()).to.equal(0);
    })

    it("Transfer Before and After Lock/Unlock", async () => {
        expect(await this.token.connect(accts[1]).transferFrom(addrs[1], addrs[2], 5)).to.be.ok;

        await expect(this.token.connect(accts[0]).unlockAndTransferId(addrs[1], addrs[2], 6)).to.be.revertedWith("NotALock");
        await expect(this.token.connect(accts[10]).unlockAndTransferId(addrs[1], addrs[2], 100)).to.be.revertedWith("TokenNotExist");
        await expect(this.token.connect(accts[10]).unlockAndTransferId(addrs[1], addrs[2], 6)).to.be.revertedWith("NotLocked");

        expect(await this.token.connect(accts[10]).lockId(addrs[1], 6)).to.be.ok;
        await expect(this.token.connect(accts[10]).unlockAndTransferId(addrs[1], addrs[2], 6)).to.emit(this.token, "UnlockAndTransferToken").withArgs(addrs[10], addrs[2], 6);

        expect(await this.token.connect(accts[2]).addLocks([addrs[10]])).to.be.ok;
        expect(await this.token.connect(accts[10]).lockId(addrs[2], 6)).to.be.ok;

        await expect(this.token.connect(accts[10]).unlockAndTransferId(addrs[2], addrs[1], 6)).to.be.revertedWith("TransferCallerNotOwnerNorApproved");

        expect(await this.token.connect(accts[2]).setApprovalForAll(this.token.address, true)).to.be.ok;
        await expect(this.token.connect(accts[10]).unlockAndTransferId(addrs[2], addrs[1], 6)).to.emit(this.token, "UnlockAndTransferToken").withArgs(addrs[10], addrs[1], 6);

        expect(await this.token.connect(accts[10]).lockId(addrs[1], 6)).to.be.ok;
        expect(await this.token.connect(accts[11]).lockId(addrs[1], 6)).to.be.ok;
        expect(await this.token.connect(accts[12]).lockId(addrs[1], 6)).to.be.ok;

        await expect(this.token.connect(accts[10]).unlockAndTransferId(addrs[1], addrs[2], 6)).to.be.revertedWith("HaveLocks");
        await expect(this.token.connect(accts[10]).unlockAndTransferAll(addrs[1], addrs[2])).to.be.revertedWith("HaveLocks");

        expect(await this.token.connect(accts[11]).unlockId(addrs[1], 6)).to.be.ok;
        expect(await this.token.connect(accts[12]).unlockId(addrs[1], 6)).to.be.ok;

        expect(await this.token.connect(accts[10]).lockId(addrs[1], 7)).to.be.ok;
        expect(await this.token.connect(accts[10]).lockId(addrs[1], 8)).to.be.ok;

        await expect(() => this.token.connect(accts[10]).unlockAndTransferAll(addrs[1], addrs[2])).to.changeTokenBalances(this.token, [accts[1], accts[2]], [-3, 3]);

        expect(await this.token.balanceOf(addrs[1])).to.equal(1);
        expect((await this.token.getOwnerTokens(addrs[1])).length).to.equal(0);
        expect((await this.token.getOwnerLocks(addrs[1])).length).to.equal(3);
        expect(await this.token.getTokenLocks(6)).to.eql([]);
        expect((await this.token.getLockTokens(addrs[11], addrs[1])).length).to.equal(0);
        expect(await this.token.totalLockTokens()).to.equal(0);
    })

})