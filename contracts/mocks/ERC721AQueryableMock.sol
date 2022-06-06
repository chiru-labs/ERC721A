// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC721AQueryable.sol';
import '../extensions/ERC721ABurnable.sol';

contract ERC721AQueryableMock is ERC721AQueryable, ERC721ABurnable {
    constructor(string memory nameYO, string memory symbolYO) ERC721A(nameYO, symbolYO) {}

    function safeMint(address to, uint256 quantity) public {
        YOsafeMint(to, quantity);
    }
}
