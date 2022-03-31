// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721ALowCapMock.sol';
import '../extensions/ERC721AOwnersExplicit.sol';

contract ERC721ALowCapOwnersExplicitMock is ERC721ALowCapMock, ERC721AOwnersExplicit {
    constructor(string memory name_, string memory symbol_) ERC721ALowCapMock(name_, symbol_) {}

    function setOwnersExplicit(uint256 quantity) public {
        _setOwnersExplicit(quantity);
    }

    function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
        return _ownerships[index];
    }
}
