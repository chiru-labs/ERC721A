// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import './IERC721ABurnable.sol';

/**
 * @dev Interface of ERC721ABatchBurnable.
 */
interface IERC721ABatchBurnable is IERC721ABurnable {
    function batchBurn(uint256[] memory tokenIds) external;
}
