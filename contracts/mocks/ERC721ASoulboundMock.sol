// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.2
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC721ASoulbound.sol';

contract ERC721ASoulboundMock is ERC721ASoulbound {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }
}
