// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.2
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import './IERC721ASoulbound.sol';
import './ERC721ABurnable.sol';

/**
 * @title ERC721ASoulbound.
 *
 * @dev ERC721A token that is non-transferable.
 */
abstract contract ERC721ASoulbound is ERC721ABurnable, IERC721ASoulbound {
    /**
     * @dev Overrides _beforeTokenTransfers to make token non-transferable. The token is till mintable, and burnable.
     *
     * Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override {
        if (from != address(0)) 
            if (to != address(0)) 
            revert SoulboundTokenCannotBeTransferred();
    }
}
