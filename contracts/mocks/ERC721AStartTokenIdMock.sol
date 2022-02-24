// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AMock.sol';

contract StartTokenId {
    uint256 startTokenId;

    constructor(uint256 startTokenId_) {
        startTokenId = startTokenId_;
    }

    function getStartTokenId() public view returns (uint256) {
        return startTokenId;
    }
}

contract ERC721AStartTokenIdMock is StartTokenId, ERC721AMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) StartTokenId(startTokenId_) ERC721AMock(name_, symbol_) {}

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId;
    }
}
