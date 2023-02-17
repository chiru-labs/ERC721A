// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './ERC721A.sol';

contract ERC721ATest is ERC721A {

    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) { }

    function isBurned(uint tokenId) public view returns (bool) {
        return _packedOwnershipOf(tokenId) & _BITMASK_BURNED != 0;
    }

    //
    // invariant
    //

    // inv1: the balance of the owner of an existing token is non-zero.
    function inv1(uint tokenId) public view returns (bool) {
        return !_exists(tokenId) || balanceOf(ownerOf(tokenId)) > 0;
    }

    // inv2: the ownership slot of unminted tokens is uninitialized.
    function inv2(uint tokenId) public view returns (bool) {
        return !(_packedOwnerships[tokenId] != 0) || tokenId < _nextTokenId();
    }

    // inv3: if the ownership slot is uninitialized, their parent token's _BITMASK_NEXT_INITIALIZED is unset.
    function inv3(uint tokenId) public view returns (bool) {
        return !(_packedOwnerships[tokenId] == 0) || _packedOwnershipOf(tokenId) & _BITMASK_NEXT_INITIALIZED == 0;
    }

    // inv4: if _BITMASK_NEXT_INITIALIZED is set, the ownership slot of the next token (if any) is initialized.
    function inv4(uint tokenId) public view returns (bool) {
        return !(_packedOwnershipOf(tokenId) & _BITMASK_NEXT_INITIALIZED != 0)
            || !(tokenId + 1 < _nextTokenId())
            || _packedOwnerships[tokenId + 1] != 0;
    }

    /* this is no longer required since https://github.com/chiru-labs/ERC721A/pull/447
    // inv5: the uninitialized token is not burned.
    function inv5(uint tokenId) public view returns (bool) {
        return !(_packedOwnerships[tokenId] == 0) || !isBurned(tokenId);
    }
    */

    function proveInvariant1(uint tokenId, address addr1, address addr2, uint num, uint rand) public { _proveInvariant(inv1(tokenId), addr1, addr2, num, rand); }
    function proveInvariant2(uint tokenId, address addr1, address addr2, uint num, uint rand) public { _proveInvariant(inv2(tokenId), addr1, addr2, num, rand); }
    function proveInvariant3(uint tokenId, address addr1, address addr2, uint num, uint rand) public { _proveInvariant(inv3(tokenId), addr1, addr2, num, rand); }
    function proveInvariant4(uint tokenId, address addr1, address addr2, uint num, uint rand) public { _proveInvariant(inv4(tokenId), addr1, addr2, num, rand); }

    function _proveInvariant(
        bool inv,
        address addr1, address addr2, uint num,
        uint rand
    ) internal {
        require(inv);

        if (rand == 0) {
            mint(addr1, num);
        } else if (rand == 1) {
            burn(num);
        } else {
            transfer(addr1, addr2, num);
        }

        assert(inv);
    }

    //
    // mint
    //

    // TODO: duplicate spec for _mintERC2309 and _safeMint
    function mint(address to, uint quantity) public {
        _mint(to, quantity);
      //_mintERC2309(to, quantity);
      //_safeMint(to, quantity);
      //_safeMint(to, quantity, data);
    }

    function testMintRequirements(address to, uint quantity) public {
        mint(to, quantity);

        assert(to != address(0));
        assert(quantity > 0);
    }

    function testMintNextTokenIdUpdate(address to, uint quantity) public {
        uint oldNextTokenId = _nextTokenId();
        require(oldNextTokenId <= type(uint96).max); // practical assumption needed for overflow/underflow not occurring

        mint(to, quantity);

        uint newNextTokenId = _nextTokenId();

        assert(newNextTokenId >= oldNextTokenId); // ensuring no overflow
        assert(newNextTokenId == oldNextTokenId + quantity);
    }

    function testMintBalanceUpdate(address to, uint quantity) public {
        uint oldBalanceTo = balanceOf(to);
        require(oldBalanceTo <= type(uint64).max / 2); // practical assumption needed for balance staying within uint64

        mint(to, quantity);

        uint newBalanceTo = balanceOf(to);

        assert(newBalanceTo >= oldBalanceTo); // ensuring no overflow
        assert(newBalanceTo == oldBalanceTo + quantity);
    }

    function testMintOwnershipUpdate(address to, uint quantity, uint _newNextTokenId) public {
        uint oldNextTokenId = _nextTokenId();
        require(oldNextTokenId <= type(uint96).max); // practical assumption needed for overflow/underflow not occurring

        // local instances of inv2
        for (uint i = oldNextTokenId; i < _newNextTokenId; i++) {
            require(_packedOwnerships[i] == 0); // assumption for uninitialized mappings (i.e., no hash collision for hashed storage addresses)
        }

        mint(to, quantity);

        uint newNextTokenId = _nextTokenId();
        require(_newNextTokenId == newNextTokenId);

        for (uint i = oldNextTokenId; i < newNextTokenId; i++) {
            assert(ownerOf(i) == to);
            assert(!isBurned(i));
        }
    }

    function testMintOtherBalancePreservation(address to, uint quantity, address others) public {
        require(others != to); // consider other addresses

        uint oldBalanceOther = balanceOf(others);

        mint(to, quantity);

        uint newBalanceOther = balanceOf(others);

        assert(newBalanceOther == oldBalanceOther); // the balance of other addresses never change
    }

    function testMintOtherOwnershipPreservation(address to, uint quantity, uint existingTokenId) public {
        uint oldNextTokenId = _nextTokenId();
        require(oldNextTokenId <= type(uint96).max); // practical assumption needed for overflow/underflow not occurring

        require(existingTokenId < oldNextTokenId); // consider other token ids

        address oldOwnerExisting = ownerOf(existingTokenId);
        bool oldBurned = isBurned(existingTokenId);

        mint(to, quantity);

        address newOwnerExisting = ownerOf(existingTokenId);
        bool newBurned = isBurned(existingTokenId);

        assert(newOwnerExisting == oldOwnerExisting); // the owner of other token ids never change
        assert(newBurned == oldBurned);
    }

    //
    // burn
    //

    // TODO: duplicate spec for both modes
    function burn(uint tokenId) public {
      //_burn(tokenId, true);
        _burn(tokenId, false);
    }

    function testBurnRequirements(uint tokenId) public {
        require(inv2(tokenId));

        bool exist = _exists(tokenId);
        bool burned = isBurned(tokenId);

        address owner = ownerOf(tokenId);
        bool approved = msg.sender == _tokenApprovals[tokenId].value || isApprovedForAll(owner, msg.sender);

        _burn(tokenId, true);

        assert(exist); // it should have reverted if the token id does not exist
        assert(!burned);

        assert(msg.sender == owner || approved);

        assert(_tokenApprovals[tokenId].value == address(0)); // getApproved(tokenId) reverts here
    }

    function testBurnNextTokenIdUnchanged(uint tokenId) public {
        uint oldNextTokenId = _nextTokenId();

        burn(tokenId);

        uint newNextTokenId = _nextTokenId();

        assert(newNextTokenId == oldNextTokenId);
    }

    function testBurnBalanceUpdate(uint tokenId) public {
        require(inv1(tokenId));
        require(inv2(tokenId));

        address from = ownerOf(tokenId);
        uint oldBalanceFrom = balanceOf(from);

        burn(tokenId);

        uint newBalanceFrom = balanceOf(from);

        assert(newBalanceFrom < oldBalanceFrom); // ensuring no overflow
        assert(newBalanceFrom == oldBalanceFrom - 1);
    }

    function testBurnOwnershipUpdate(uint tokenId) public {
        burn(tokenId);

        assert(!_exists(tokenId));
        assert(_packedOwnerships[tokenId] & _BITMASK_BURNED != 0); // isBurned reverts here
    }

    function testBurnOtherBalancePreservation(uint tokenId, address others) public {
        address from = ownerOf(tokenId);
        require(others != from); // consider other addresses

        uint oldBalanceOther = balanceOf(others);

        burn(tokenId);

        uint newBalanceOther = balanceOf(others);

        assert(newBalanceOther == oldBalanceOther);
    }

    function testBurnOtherOwnershipPreservation(uint tokenId, uint otherTokenId) public {
        require(inv2(tokenId));
        require(inv3(tokenId));
        require(inv4(tokenId));

        require(_nextTokenId() <= type(uint96).max); // practical assumption needed for avoiding overflow/underflow

        require(otherTokenId != tokenId); // consider other token ids

        address oldOtherTokenOwner = ownerOf(otherTokenId);
        bool oldBurned = isBurned(otherTokenId);

        burn(tokenId);

        address newOtherTokenOwner = ownerOf(otherTokenId);
        bool newBurned = isBurned(otherTokenId);

        assert(newOtherTokenOwner == oldOtherTokenOwner);
        assert(newBurned == oldBurned);
    }

    //
    // transfer
    //

    // TODO: duplicate spec for safeTransferFrom
    function transfer(address from, address to, uint tokenId) public {
        transferFrom(from, to, tokenId);
      //safeTransferFrom(from, to, tokenId);
      //safeTransferFrom(from, to, tokenId, data);
    }

    function testTransferRequirements(address from, address to, uint tokenId) public {
        require(inv2(tokenId));

        bool exist = _exists(tokenId);
        bool burned = isBurned(tokenId);

        address owner = ownerOf(tokenId);
        bool approved = msg.sender == _tokenApprovals[tokenId].value || isApprovedForAll(owner, msg.sender);

        transfer(from, to, tokenId);

        assert(exist); // it should have reverted if the token id does not exist
        assert(!burned);

      //assert(from != address(0)); // NOTE: ERC721A doesn't explicitly check this condition
        assert(to != address(0));

        assert(from == owner);
        assert(msg.sender == owner || approved);

        assert(_tokenApprovals[tokenId].value == address(0));
    }

    function testTransferNextTokenIdUnchanged(address from, address to, uint tokenId) public {
        uint oldNextTokenId = _nextTokenId();

        transfer(from, to, tokenId);

        uint newNextTokenId = _nextTokenId();

        assert(newNextTokenId == oldNextTokenId);
    }

    function testTransferBalanceUpdate(address from, address to, uint tokenId) public {
        require(inv1(tokenId));
        require(inv2(tokenId));

        require(from != to); // consider normal transfer case (see below for the self-transfer case)

        uint oldBalanceFrom = balanceOf(from);
        uint oldBalanceTo   = balanceOf(to);

        require(oldBalanceTo <= type(uint64).max / 2); // practical assumption needed for balance staying within uint64

        transfer(from, to, tokenId);

        uint newBalanceFrom = balanceOf(from);
        uint newBalanceTo   = balanceOf(to);

        assert(newBalanceFrom < oldBalanceFrom);
        assert(newBalanceFrom == oldBalanceFrom - 1);

        assert(newBalanceTo > oldBalanceTo);
        assert(newBalanceTo == oldBalanceTo + 1);
    }

    function testTransferBalanceUnchanged(address from, address to, uint tokenId) public {
        require(from == to); // consider self-transfer case

        uint oldBalance = balanceOf(from); // == balanceOf(to);

        transfer(from, to, tokenId);

        uint newBalance = balanceOf(from); // == balanceOf(to);

        assert(newBalance == oldBalance);
    }

    function testTransferOwnershipUpdate(address from, address to, uint tokenId) public {
        transfer(from, to, tokenId);

        assert(ownerOf(tokenId) == to);
        assert(!isBurned(tokenId));
    }

    function testTransferOtherBalancePreservation(address from, address to, uint tokenId, address others) public {
        require(others != from); // consider other addresses
        require(others != to);

        uint oldBalanceOther = balanceOf(others);

        transfer(from, to, tokenId);

        uint newBalanceOther = balanceOf(others);

        assert(newBalanceOther == oldBalanceOther);
    }

    function testTransferOtherOwnershipPreservation(address from, address to, uint tokenId, uint otherTokenId) public {
        require(inv2(tokenId));
        require(inv3(tokenId));
        require(inv4(tokenId));

        require(_nextTokenId() <= type(uint96).max); // practical assumption needed for avoiding overflow/underflow

        require(otherTokenId != tokenId); // consider other token ids

        address oldOtherTokenOwner = ownerOf(otherTokenId);
        bool oldBurned = isBurned(otherTokenId);

        transfer(from, to, tokenId);

        address newOtherTokenOwner = ownerOf(otherTokenId);
        bool newBurned = isBurned(otherTokenId);

        assert(newOtherTokenOwner == oldOtherTokenOwner);
        assert(newBurned == oldBurned);
    }
}
