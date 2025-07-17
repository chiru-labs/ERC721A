// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.3.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../ERC721A.sol';

contract ERC721AWithERC2309Mock is ERC721A {
    constructor(
        string memory name_,
        string memory symbol_,
        address to,
        uint256 quantity,
        bool mintInConstructor
    ) ERC721A(name_, symbol_) {
        if (mintInConstructor) {
            _mintERC2309(to, quantity);
        }
    }

    /**
     * @dev This function is only for gas comparison purposes.
     * Calling `_mintERC3201` outside of contract creation is non-compliant
     * with the ERC721 standard.
     */
    function mintOneERC2309(address to) public {
        _mintERC2309(to, 1);
    }

    /**
     * @dev This function is only for gas comparison purposes.
     * Calling `_mintERC3201` outside of contract creation is non-compliant
     * with the ERC721 standard.
     */
    function mintTenERC2309(address to) public {
        _mintERC2309(to, 10);
    }
}
