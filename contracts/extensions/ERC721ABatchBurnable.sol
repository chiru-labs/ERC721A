// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721ABurnable.sol';
import './IERC721ABatchBurnable.sol';

/**
 * @title ERC721ABatchBurnable.
 *
 * @dev ERC721A token optimized for batch burns.
 */
abstract contract ERC721ABatchBurnable is ERC721ABurnable, IERC721ABatchBurnable {
    function batchBurn(uint256[] memory tokenIds) public virtual override {
        _batchBurn(_msgSenderERC721A(), tokenIds);
    }
}
