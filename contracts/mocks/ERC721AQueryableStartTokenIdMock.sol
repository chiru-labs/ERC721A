// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.3.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AQueryableMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721AQueryableStartTokenIdMock is StartTokenIdHelper, ERC721AQueryableMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) StartTokenIdHelper(startTokenId_) ERC721AQueryableMock(name_, symbol_) {}

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId();
    }
}
