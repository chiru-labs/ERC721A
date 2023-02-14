// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC721AQueryable.sol';
import '../extensions/ERC721ABurnable.sol';
import './DirectBurnBitSetterHelper.sol';

contract ERC721AQueryableMock is ERC721AQueryable, ERC721ABurnable, DirectBurnBitSetterHelper {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }
}
