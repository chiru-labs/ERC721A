// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AOwnersExplicitMock.sol';

contract ERC721AStartOneOwnersExplicitMock is ERC721AOwnersExplicitMock {
    constructor(string memory name_, string memory symbol_) ERC721AOwnersExplicitMock(name_, symbol_) {}

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
