// SPDX-License-Identifier: MIT
// ERC721A Contracts v3.3.0
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import '../ERC721A.sol';

abstract contract ERC721AOwnersExplicit is ERC721A {
    /**
     * No more ownership slots to explicity initialize.
     */
    error AllOwnershipsInitialized();

    /**
     * The `quantity` must be more than zero.
     */
    error InitializeZeroQuantity();

    /**
     * At least one token needs to be minted.
     */
    error NoTokensMintedYet();

    // The next token ID to explicity initialize ownership data.
    uint256 private _currentIndexOwnersExplicit;

    /**
     * @dev Returns the next token ID to be explicity initialized.
     */
    function _nextTokenIdOwnersExplicit() internal view returns (uint256) {
        uint256 tokenId = _currentIndexOwnersExplicit;
        if (tokenId == 0) {
            tokenId = _startTokenId();
        }
        return tokenId;
    }

    /**
     * @dev Explicitly initialize ownerships to eliminate loops in future calls of `ownerOf()`.
     */
    function _initializeOwnersExplicit(uint256 quantity) internal {
        if (quantity == 0) revert InitializeZeroQuantity();
        uint256 stopLimit = _nextTokenId();
        if (stopLimit == _startTokenId()) revert NoTokensMintedYet();
        uint256 start = _nextTokenIdOwnersExplicit();
        if (start >= stopLimit) revert AllOwnershipsInitialized();

        // Index underflow is impossible.
        // Counter or index overflow is incredibly unrealistic.
        unchecked {
            uint256 stop = start + quantity;

            // Set the end index to be the last token index
            if (stop > stopLimit) {
                stop = stopLimit;
            }

            for (uint256 i = start; i < stop; i++) {
                _initializeOwnershipAt(i);
            }

            _currentIndexOwnersExplicit = stop;
        }
    }
}
