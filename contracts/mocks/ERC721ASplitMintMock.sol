// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import "../ERC721A.sol";
import "../extensions/ERC721ASplitMint.sol";

contract ERC721ASplitMintMock is ERC721A, ERC721ASplitMint {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function _mintBatchSize() override internal pure returns (uint256) {
        return DEFAULT_MINT_BATCH_SIZE;
    }

    function mint(uint256 quantity) public {
        _splitMint(msg.sender, quantity);
    }

}
