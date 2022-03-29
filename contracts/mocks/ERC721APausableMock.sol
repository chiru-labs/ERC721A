// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC721APausable.sol';
import '../extensions/ERC721ABurnable.sol';

contract ERC721APausableMock is ERC721A, ERC721APausable, ERC721ABurnable {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override(ERC721A, ERC721APausable) {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);
    }

    function pause() external {
        _pause();
    }

    function unpause() external {
        _unpause();
    }
}
