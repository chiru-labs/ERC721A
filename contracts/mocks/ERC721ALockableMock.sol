// SPDX-License-Identifier: MIT
// Creators: LikKee

pragma solidity ^0.8.4;

import '../extensions/ERC721ALockable.sol';

contract ERC721ALockableMock is ERC721ALockable {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function mint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }
}
