// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creator: @caffeinum

pragma solidity ^0.8.4;

import '../ERC721A.sol';

/**
 * @title ERC721A Split Mint
 * @dev Splits mint into batches by _mintBatchSize tokens. 
 */
abstract contract ERC721ASplitMint is ERC721A {

    uint256 constant DEFAULT_MINT_BATCH_SIZE = 10;

    /**
     * @dev Override _mintBatchSize for your custom needs
     * Using more than 16000 will probably fail: https://github.com/chiru-labs/ERC721A/issues/83#issuecomment-1125686598
     * Cannot be zero
     * We require to implement this function in the child contract
     */
    function _mintBatchSize() internal pure virtual returns (uint256) {}

    function _splitMint(
        address to,
        uint256 quantity
    ) internal {
        _splitMint(to, quantity, '');
    }

    /**
     * @dev To save gas, splits mint into batches under the hood.
     * 
     * Emits a {Transfer} event.
     */
    function _splitMint(
        address to,
        uint256 quantity,
        bytes memory _data
    ) internal {
        if (quantity == 0) revert MintZeroQuantity();

        // split quantity in batches by 10 tokens and call mint for each batch
        uint256 batchSize = _mintBatchSize();

        uint lastBatch = quantity / batchSize;
        uint remainder = quantity % batchSize;

        for (uint i = 0; i < lastBatch; i++) {
            _safeMint(to, batchSize, _data);
        }

        if (remainder > 0) {
            _safeMint(to, remainder, _data);
        }
    }
}
