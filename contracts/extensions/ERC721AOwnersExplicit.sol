// SPDX-License-Identifier: MIT
// Creator: Chiru Labs

pragma solidity ^0.8.0;

import '../ERC721A.sol';

abstract contract ERC721AOwnersExplicit is ERC721A {
    uint256 public nextOwnerToExplicitlySet;

    /**
     * @dev Explicitly set `owners` to eliminate loops in future calls of ownerOf().
     */
    function _setOwnersExplicit(uint256 quantity) internal {
        require(quantity != 0, 'quantity must be nonzero');
        require(currentIndex != 0, 'no tokens minted yet');
        uint256 _nextOwnerToExplicitlySet = nextOwnerToExplicitlySet;
        require(_nextOwnerToExplicitlySet < currentIndex, 'all ownerships have been set');

        // Index underflow is impossible.
        // Counter or index overflow is incredibly unrealistic.
        unchecked {
            uint256 endIndex = _nextOwnerToExplicitlySet + quantity - 1;

            // Set the end index to be the last token index
            if (endIndex + 1 > currentIndex) {
                endIndex = currentIndex - 1;
            }

            for (uint256 i = _nextOwnerToExplicitlySet; i <= endIndex; i++) {
                if (_ownerships[i].addr == address(0)) {
                    TokenOwnership memory ownership = ownershipOf(i);
                    _ownerships[i].addr = ownership.addr;
                    _ownerships[i].startTimestamp = ownership.startTimestamp;
                }
            }

            nextOwnerToExplicitlySet = endIndex + 1;
        }
    }
}
