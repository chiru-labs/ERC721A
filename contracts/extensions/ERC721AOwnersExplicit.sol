// SPDX-License-Identifier: MIT
// Creator: Chiru Labs

pragma solidity ^0.8.0;

import '../ERC721A.sol';

abstract contract ERC721AOwnersExplicit is ERC721A {
    uint256 public nextOwnerToExplicitlySet = 0;

    /**
     * @dev Explicitly set `owners` to eliminate loops in future calls of ownerOf().
     */
    function _setOwnersExplicit(uint256 quantity) internal {
        require(quantity > 0, 'quantity must be nonzero');
        require(currentIndex > 0, 'no tokens minted yet');
        require(nextOwnerToExplicitlySet < currentIndex, 'all ownerships have been set');

        uint256 oldNextOwnerToSet = nextOwnerToExplicitlySet;
        uint256 endIndex = oldNextOwnerToSet + quantity - 1;
        // Set the end index to be the last token index
        if (endIndex > currentIndex - 1) {
            endIndex = currentIndex - 1;
        }

        for (uint256 i = oldNextOwnerToSet; i <= endIndex; i++) {
            if (_ownerships[i].addr == address(0)) {
                TokenOwnership memory ownership = ownershipOf(i);
                _ownerships[i] = TokenOwnership(ownership.addr, ownership.startTimestamp);
            }
        }
        nextOwnerToExplicitlySet = endIndex + 1;
    }
}
