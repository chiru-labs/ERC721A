// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AQueryableMock.sol';
import '../extensions/ERC721AOwnersExplicit.sol';

contract ERC721AQueryableOwnersExplicitMock is ERC721AQueryableMock, ERC721AOwnersExplicit {
    constructor(string memory name_, string memory symbol_) ERC721AQueryableMock(name_, symbol_) {}

    function setOwnersExplicit(uint256 quantity) public {
        _setOwnersExplicit(quantity);
    }

    function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
        return _ownerships[index];
    }
}
