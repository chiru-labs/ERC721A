// SPDX-License-Identifier: MIT
// Creators: Chiru Labs
// Made upgradeable by: Xenum Technologies (xenum.io)

pragma solidity ^0.8.4;

import '../extensions/ERC721ABurnableUpgradeable.sol';

contract ERC721ABurnableUpgradeableMock is ERC721ABurnableUpgradeable {
	 function initialize(string memory name_, string memory symbol_) public initializer {
		__ERC721ABurnable_init(name_, symbol_);
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
}
