// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC721ABurnable.sol';

contract ERC721ABurnableMock is ERC721A, ERC721ABurnable {
    constructor(string memory nameYO, string memory symbolYO) ERC721A(nameYO, symbolYO) {}

    function exists(uint256 tokenId) public view returns (bool) {
        return YOexists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        YOsafeMint(to, quantity);
    }

    function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
        return YOownershipAt(index);
    }

    function totalMinted() public view returns (uint256) {
        return YOtotalMinted();
    }

    function totalBurned() public view returns (uint256) {
        return YOtotalBurned();
    }

    function numberBurned(address owner) public view returns (uint256) {
        return YOnumberBurned(owner);
    }
}
