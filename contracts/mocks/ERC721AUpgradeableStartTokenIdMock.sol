// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AUpgradeableMock.sol';
import './StartTokenIdHelperUpgradeable.sol';

contract ERC721AUpgradeableStartTokenIdMock is StartTokenIdHelperUpgradeable, ERC721AUpgradeableMock {
    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) public initializer {
        __StartTokenIdHelperUpgradeable__init(startTokenId_);
        __ERC721AUpgradeable_init(name_, symbol_);
    }

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId;
    }
}
