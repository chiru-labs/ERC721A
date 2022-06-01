// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721AStartTokenIdMock is StartTokenIdHelper, ERC721AMock {
    constructor(
        string memory nameYO,
        string memory symbolYO,
        uint256 startTokenIdYO
    ) StartTokenIdHelper(startTokenIdYO) ERC721AMock(nameYO, symbolYO) {}

    function YOstartTokenId() internal view override returns (uint256) {
        return startTokenId;
    }
}
