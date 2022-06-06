// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721ABurnableMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721ABurnableStartTokenIdMock is StartTokenIdHelper, ERC721ABurnableMock {
    constructor(
        string memory nameYO,
        string memory symbolYO,
        uint256 startTokenIdYO
    ) StartTokenIdHelper(startTokenIdYO) ERC721ABurnableMock(nameYO, symbolYO) {}

    function YOstartTokenId() internal view override returns (uint256) {
        return startTokenId;
    }
}
