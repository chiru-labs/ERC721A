// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.0;

import '../extensions/ERC721AEnumerable.sol';

contract ERC721AEnumerableMock is ERC721AEnumerable {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }
}
