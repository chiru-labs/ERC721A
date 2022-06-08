// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../ERC721A.sol';

/**
 * @dev Mock for testing and benchmarking purposes.
 * Calling `_mintERC2309` outside of contract creation breaks the ERC721 standard.
 */
contract ERC721AWithERC2309Mock is ERC721A {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function mintOneERC2309(address to) public {
        _mintERC2309(to, 1);
    }

    function mintTenERC2309(address to) public {
        _mintERC2309(to, 10);
    }

    function mintERC2309(address to, uint256 quantity) public {
        _mintERC2309(to, quantity);
    }
}
