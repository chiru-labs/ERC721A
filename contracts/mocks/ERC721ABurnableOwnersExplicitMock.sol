// SPDX-License-Identifier: MIT
// ERC721A Contracts v3.3.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC721ABurnable.sol';
import '../extensions/ERC721AOwnersExplicit.sol';

contract ERC721ABurnableOwnersExplicitMock is ERC721A, ERC721ABurnable, ERC721AOwnersExplicit {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function initializeOwnersExplicit(uint256 quantity) public {
        _initializeOwnersExplicit(quantity);
    }

    function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
        return _ownershipAt(index);
    }
}
