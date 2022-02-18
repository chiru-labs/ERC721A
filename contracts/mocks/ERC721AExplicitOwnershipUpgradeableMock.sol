// SPDX-License-Identifier: MIT
// Creators: Chiru Labs
// Made upgradeable by: Xenum Technologies (xenum.io)

pragma solidity ^0.8.4;

import '../extensions/ERC721AOwnersExplicitUpgradeable.sol';

contract ERC721AOwnersExplicitUpgradeableMock is ERC721AOwnersExplicitUpgradeable {
	 function initialize(string memory name_, string memory symbol_) public initializer {
		 __ERC721AOwnersExplicit_init(name_, symbol_);
	 }

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
