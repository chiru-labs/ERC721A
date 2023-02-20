// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC721ABatchBurnable.sol';

contract ERC721ABatchBurnableMock is ERC721ABatchBurnable {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
        return _ownershipAt(index);
    }

    function totalMinted() public view returns (uint256) {
        return _totalMinted();
    }

    function totalBurned() public view returns (uint256) {
        return _totalBurned();
    }

    function numberBurned(address owner) public view returns (uint256) {
        return _numberBurned(owner);
    }

    function initializeOwnershipAt(uint256 index) public {
        _initializeOwnershipAt(index);
    }

    function batchBurnUnoptimized(uint256[] memory tokenIds) public {
        unchecked {
            uint256 tokenId;
            for (uint256 i; i < tokenIds.length; ++i) {
                tokenId = tokenIds[i];
                burn(tokenId);
            }
        }
    }
}
