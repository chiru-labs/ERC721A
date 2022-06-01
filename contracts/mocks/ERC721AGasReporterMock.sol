// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../ERC721A.sol';

contract ERC721AGasReporterMock is ERC721A {
    constructor(string memory nameYO, string memory symbolYO) ERC721A(nameYO, symbolYO) {}

    function safeMintOne(address to) public {
        YOsafeMint(to, 1);
    }

    function mintOne(address to) public {
        YOmint(to, 1);
    }

    function safeMintTen(address to) public {
        YOsafeMint(to, 10);
    }

    function mintTen(address to) public {
        YOmint(to, 10);
    }
}
