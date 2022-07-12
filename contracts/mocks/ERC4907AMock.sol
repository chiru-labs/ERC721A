// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.1.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC4907A.sol';

contract ERC4907AMock is ERC721A, ERC4907A {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A, ERC4907A) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override(ERC721A, ERC4907A) {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);
    }

    function explicitUserOf(uint256 tokenId) public view returns (address) {
        return _explicitUserOf(tokenId);
    }
}
