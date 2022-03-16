// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC721AUpgradeableBurnable.sol';

contract ERC721AUpgradeableBurnableMock is ERC721AUpgradeable, ERC721AUpgradeableBurnable {
    function initialize(string memory name_, string memory symbol_) public initializer {
        __ERC721AUpgradeable_init(name_, symbol_);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
        return _ownerships[index];
    }

    function totalMinted() public view returns (uint256) {
        return _totalMinted();
    }
}
