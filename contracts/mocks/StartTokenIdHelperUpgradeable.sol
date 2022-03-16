// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

/**
 * This Helper is used to return a dynmamic value in the overriden _startTokenId() function.
 * Extending this Helper before the ERC721A contract give us access to the herein set `startTokenId`
 * to be returned by the overriden `_startTokenId()` function of ERC721A in the ERC721AStartTokenId mocks.
 */
contract StartTokenIdHelperUpgradeable is Initializable {
    uint256 public startTokenId;

    function __StartTokenIdHelperUpgradeable__init(uint256 startTokenId_) internal onlyInitializing {
        __StartTokenIdHelperUpgradeable__init_unchained(startTokenId_);
    }

    function __StartTokenIdHelperUpgradeable__init_unchained(uint256 startTokenId_) internal onlyInitializing {
        startTokenId = startTokenId_;
    }
}
