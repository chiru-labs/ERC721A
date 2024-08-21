// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import '../ERC721A.sol';
import './IERC721ABatchTransferable.sol';

/**
 * @title ERC721ABatchTransferable.
 *
 * @dev ERC721A token optimized for batch transfers.
 */
abstract contract ERC721ABatchTransferable is ERC721A, IERC721ABatchTransferable {
    function batchTransferFrom(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public payable virtual override {
        _batchTransferFrom(_msgSenderERC721A(), from, to, tokenIds);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public payable virtual override {
        _safeBatchTransferFrom(_msgSenderERC721A(), from, to, tokenIds, '');
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory tokenIds,
        bytes memory _data
    ) public payable virtual override {
        _safeBatchTransferFrom(_msgSenderERC721A(), from, to, tokenIds, _data);
    }
}
