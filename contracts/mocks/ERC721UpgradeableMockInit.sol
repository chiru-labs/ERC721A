// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AUpgradeableMock.sol';

contract ERC721AUpgradeableMockInit is ERC721AUpgradeableMock {
    function initialize(
        string memory name_,
        string memory symbol_
    ) public initializer {
        __ERC721AUpgradeable_init(name_, symbol_);
    }
}
