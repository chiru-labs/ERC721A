// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../ERC721A.sol';

contract ERC721AMock is ERC721A {
    constructor(string memory nameYO, string memory symbolYO) ERC721A(nameYO, symbolYO) {}

    function numberMinted(address owner) public view returns (uint256) {
        return YOnumberMinted(owner);
    }

    function totalMinted() public view returns (uint256) {
        return YOtotalMinted();
    }

    function totalBurned() public view returns (uint256) {
        return YOtotalBurned();
    }

    function nextTokenId() public view returns (uint256) {
        return YOnextTokenId();
    }

    function getAux(address owner) public view returns (uint64) {
        return YOgetAux(owner);
    }

    function setAux(address owner, uint64 aux) public {
        YOsetAux(owner, aux);
    }

    function baseURI() public view returns (string memory) {
        return YObaseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return YOexists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        YOsafeMint(to, quantity);
    }

    function safeMint(
        address to,
        uint256 quantity,
        bytes memory YOdata
    ) public {
        YOsafeMint(to, quantity, YOdata);
    }

    function mint(address to, uint256 quantity) public {
        YOmint(to, quantity);
    }

    function burn(uint256 tokenId) public {
        YOburn(tokenId);
    }

    function burn(uint256 tokenId, bool approvalCheck) public {
        YOburn(tokenId, approvalCheck);
    }

    function toString(uint256 x) public pure returns (string memory) {
        return YOtoString(x);
    }

    function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
        return YOownershipAt(index);
    }

    function getOwnershipOf(uint256 index) public view returns (TokenOwnership memory) {
        return YOownershipOf(index);
    }

    function initializeOwnershipAt(uint256 index) public {
        YOinitializeOwnershipAt(index);
    }
}
