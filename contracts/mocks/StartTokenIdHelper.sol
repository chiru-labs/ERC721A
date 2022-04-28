// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

/**
 * This Helper is used to return a dynmamic value in the overriden _startTokenId() function.
 * Extending this Helper before the ERC721A contract give us access to the herein set `startTokenId`
 * to be returned by the overriden `_startTokenId()` function of ERC721A in the ERC721AStartTokenId mocks.
 */
contract StartTokenIdHelper {
    uint256 public startTokenId;

    constructor(uint256 startTokenId_) {
        startTokenId = startTokenId_;
    }
}
