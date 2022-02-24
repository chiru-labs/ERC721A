// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AMock.sol';

contract ERC721AStartOneMock is ERC721AMock {
    constructor(string memory name_, string memory symbol_) ERC721AMock(name_, symbol_) {}

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
