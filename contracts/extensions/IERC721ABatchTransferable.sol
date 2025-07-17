// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import '../IERC721A.sol';

/**
 * @dev Interface of ERC721ABatchTransferable.
 */
interface IERC721ABatchTransferable is IERC721A {
    /**
     * @dev Transfers `tokenIds` in batch from `from` to `to`. See {ERC721A-_batchTransferFrom}.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenIds` tokens must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move these tokens
     * by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event for each transfer.
     */
    function batchTransferFrom(
        address from,
        address to,
        uint256[] memory tokenIds
    ) external payable;

    /**
     * @dev Equivalent to `safeBatchTransferFrom(from, to, tokenIds, '')`.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory tokenIds
    ) external payable;

    /**
     * @dev Safely transfers `tokenIds` in batch from `from` to `to`. See {ERC721A-_safeBatchTransferFrom}.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenIds` tokens must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move these tokens
     * by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement
     * {IERC721Receiver-onERC721Received}, which is called for each transferred token.
     *
     * Emits a {Transfer} event for each transfer.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory tokenIds,
        bytes memory _data
    ) external payable;
}
