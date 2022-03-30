// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721ALowCapMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721ALowCapStartTokenIdMock is StartTokenIdHelper, ERC721ALowCapMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) StartTokenIdHelper(startTokenId_) ERC721ALowCapMock(name_, symbol_) {}

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId;
    }
}
