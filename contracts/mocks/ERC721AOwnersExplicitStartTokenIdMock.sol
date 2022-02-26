// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AOwnersExplicitMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721AOwnersExplicitStartTokenIdMock is StartTokenIdHelper, ERC721AOwnersExplicitMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) StartTokenIdHelper(startTokenId_) ERC721AOwnersExplicitMock(name_, symbol_) {}

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId;
    }
}
