// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721AStartTokenIdMock is StartTokenIdHelper, ERC721AMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint128 startTokenId_
    ) StartTokenIdHelper(startTokenId_) ERC721AMock(name_, symbol_) {}

    function _startTokenId() internal view override returns (uint128) {
        return startTokenId;
    }
}
