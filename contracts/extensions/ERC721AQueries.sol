// SPDX-License-Identifier: MIT
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import '../ERC721A.sol';

/**
 * @title ERC721A Queries
 * @dev ERC721A subclass with convenience query functions.
 */
abstract contract ERC721AQueries is ERC721A {
    /**
     * @dev Returns the `TokenOwnership` struct at `tokenId` without reverting.
     *
     * If the `tokenId` is out of bounds:
     *   - `addr` = `address(0)`
     *   - `startTimestamp` = `0`
     *   - `burned` = `false`
     *
     * If the `tokenId` is burned:
     *   - `addr` = `<Address of owner before token was burned>`
     *   - `startTimestamp` = `<Timestamp when token was burned>`
     *   - `burned = `true`
     *
     * Otherwise:
     *   - `addr` = `<Address of owner>`
     *   - `startTimestamp` = `<Timestamp of start of ownership>`
     *   - `burned = `false`
     */
    function rawOwnershipOf(uint256 tokenId) public view returns (TokenOwnership memory) {
        if (_exists(tokenId)) {
            return _ownershipOf(tokenId);
        }
        TokenOwnership memory ownership;
        if (_ownerships[tokenId].burned) {
            ownership = _ownerships[tokenId];
        }
        return ownership;
    }

    /**
     * @dev Returns an array of `TokenOwnership` structs at `tokenIds` in order.
     * See {ERC721AQueries-rawOwnershipOf}
     */
    function rawOwnershipsOf(uint256[] memory tokenIds) external view returns (TokenOwnership[] memory) {
        unchecked {
            uint256 n = tokenIds.length;
            TokenOwnership[] memory a = new TokenOwnership[](n);
            for (uint256 i; i != n; ++i) {
                a[i] = rawOwnershipOf(tokenIds[i]);
            }
            return a;
        }
    }

    /**
     * @dev Returns an array of token IDs owned by `owner`,
     * in the range [`start`, `stop`)
     * (i.e. `start <= tokenId < stop`).
     *
     * This function allows for tokens to be queried if the collection
     * grows too big for a single call of {ERC721AQueries-tokensOfOwner}.
     */
    function tokensOfOwnerIn(
        address owner,
        uint256 start,
        uint256 stop
    ) external view returns (uint256[] memory) {
        unchecked {
            uint256 tokenIdsIdx;
            uint256 stopLimit = _currentIndex;
            // Set `start = max(start, _startTokenId())`.
            if (start < _startTokenId()) {
                start = _startTokenId();
            }
            // Set `stop = min(stop, _currentIndex)`.
            if (stop > stopLimit) {
                stop = stopLimit;
            }
            uint256 n = balanceOf(owner);
            // Set `n = min(balanceOf(owner), stop - start)`,
            // to cater for cases where `balanceOf(owner)` is too big.
            if (start < stop) {
                uint256 d = stop - start;
                if (d < n) {
                    n = d;
                }
            } else {
                n = 0;
            }
            uint256[] memory a = new uint256[](n);
            // We need to call `rawOwnershipOf(start)`, 
            // because the slot at `start` may not be initialized.
            TokenOwnership memory ownership = rawOwnershipOf(start);
            address currOwnershipAddr;
            // If the starting slot exists, initialize `currOwnershipAddr`.
            if (ownership.addr != address(0) && !ownership.burned) {
                currOwnershipAddr = ownership.addr;
            }
            for (uint256 i = start; i != stop && tokenIdsIdx != n; ++i) {
                ownership = _ownerships[i];
                if (ownership.burned) {
                    continue;
                }
                if (ownership.addr != address(0)) {
                    currOwnershipAddr = ownership.addr;
                }
                if (currOwnershipAddr == owner) {
                    a[tokenIdsIdx++] = i;
                }
            }
            // The assembly requires a non-empty array.
            if (n != 0) {
                // Downsize the array to fit.
                assembly {
                    mstore(a, tokenIdsIdx)
                }
            }
            return a;
        }
    }

    /**
     * @dev Returns an array of token IDs owned by `owner`.
     *
     * This function scans the ownership mapping and is O(totalSupply) in complexity.
     * It is meant to be called off-chain.
     *
     * See {ERC721AQueries-tokensOfOwnerIn} for splitting the scan into
     * multiple smaller scans if the collection is large enough to cause
     * an out-of-gas error (10K pfp collections should be fine).
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        unchecked {
            uint256 tokenIdsIdx;
            address currOwnershipAddr;
            uint256 n = balanceOf(owner);
            uint256[] memory a = new uint256[](n);
            TokenOwnership memory ownership;
            for (uint256 i = _startTokenId(); tokenIdsIdx != n; ++i) {
                ownership = _ownerships[i];
                if (ownership.burned) {
                    continue;
                }
                if (ownership.addr != address(0)) {
                    currOwnershipAddr = ownership.addr;
                }
                if (currOwnershipAddr == owner) {
                    a[tokenIdsIdx++] = i;
                }
            }
            return a;
        }
    }
}
