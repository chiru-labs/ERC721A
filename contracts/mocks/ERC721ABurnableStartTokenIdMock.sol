// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721ABurnableMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721ABurnableStartTokenIdMock is StartTokenIdHelper, ERC721ABurnableMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) StartTokenIdHelper(startTokenId_) ERC721ABurnableMock(name_, symbol_) {}

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId();
    }
}
