// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.0;

import "../extensions/ERC721AOwnersExplicit.sol";

contract ERC721AOwnersExplicitMock is ERC721AOwnersExplicit {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxBatchSize_
    ) ERC721A(name_, symbol_, maxBatchSize_) {}

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function setOwnersExplicit(uint256 quantity) public {
        _setOwnersExplicit(quantity);
    }

    function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
        return _ownerships[index];
    }
}
