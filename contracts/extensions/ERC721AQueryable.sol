// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.3.0
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import './IERC721AQueryable.sol';
import '../ERC721A.sol';

/**
 * @title ERC721AQueryable.
 *
 * @dev ERC721A subclass with convenience query functions.
 */
abstract contract ERC721AQueryable is ERC721A, IERC721AQueryable {
    /**
     * @dev Returns the `TokenOwnership` struct at `tokenId` without reverting.
     *
     * If the `tokenId` is out of bounds:
     *
     * - `addr = address(0)`
     * - `startTimestamp = 0`
     * - `burned = false`
     * - `extraData = 0`
     *
     * If the `tokenId` is burned:
     *
     * - `addr = <Address of owner before token was burned>`
     * - `startTimestamp = <Timestamp when token was burned>`
     * - `burned = true`
     * - `extraData = <Extra data when token was burned>`
     *
     * Otherwise:
     *
     * - `addr = <Address of owner>`
     * - `startTimestamp = <Timestamp of start of ownership>`
     * - `burned = false`
     * - `extraData = <Extra data at start of ownership>`
     */
    function explicitOwnershipOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (TokenOwnership memory ownership)
    {
        unchecked {
            if (tokenId >= _startTokenId()) {
                if (tokenId > _sequentialUpTo()) return _ownershipAt(tokenId);

                if (tokenId < _nextTokenId()) {
                    // If the `tokenId` is within bounds,
                    // scan backwards for the initialized ownership slot.
                    while (!_ownershipIsInitialized(tokenId)) --tokenId;
                    return _ownershipAt(tokenId);
                }
            }
        }
    }

    /**
     * @dev Returns an array of `TokenOwnership` structs at `tokenIds` in order.
     * See {ERC721AQueryable-explicitOwnershipOf}
     */
    function explicitOwnershipsOf(uint256[] calldata tokenIds)
        external
        view
        virtual
        override
        returns (TokenOwnership[] memory)
    {
        TokenOwnership[] memory ownerships;
        uint256 i = tokenIds.length;
        assembly {
            // Grab the free memory pointer.
            ownerships := mload(0x40)
            // Store the length.
            mstore(ownerships, i)
            // Allocate one word for the length,
            // `tokenIds.length` words for the pointers.
            i := shl(5, i) // Multiply `i` by 32.
            mstore(0x40, add(add(ownerships, 0x20), i))
        }
        while (i != 0) {
            uint256 tokenId;
            assembly {
                i := sub(i, 0x20)
                tokenId := calldataload(add(tokenIds.offset, i))
            }
            TokenOwnership memory ownership = explicitOwnershipOf(tokenId);
            assembly {
                // Store the pointer of `ownership` in the `ownerships` array.
                mstore(add(add(ownerships, 0x20), i), ownership)
            }
        }
        return ownerships;
    }

    /**
     * @dev Returns an array of token IDs owned by `owner`,
     * in the range [`start`, `stop`)
     * (i.e. `start <= tokenId < stop`).
     *
     * This function allows for tokens to be queried if the collection
     * grows too big for a single call of {ERC721AQueryable-tokensOfOwner}.
     *
     * Requirements:
     *
     * - `start < stop`
     */
    function tokensOfOwnerIn(
        address owner,
        uint256 start,
        uint256 stop
    ) external view virtual override returns (uint256[] memory) {
        return _tokensOfOwnerIn(owner, start, stop);
    }

    /**
     * @dev Returns an array of token IDs owned by `owner`.
     *
     * This function scans the ownership mapping and is O(`totalSupply`) in complexity.
     * It is meant to be called off-chain.
     *
     * See {ERC721AQueryable-tokensOfOwnerIn} for splitting the scan into
     * multiple smaller scans if the collection is large enough to cause
     * an out-of-gas error (10K collections should be fine).
     */
    function tokensOfOwner(address owner) external view virtual override returns (uint256[] memory) {
        // If spot mints are enabled, full-range scan is disabled.
        if (_sequentialUpTo() != type(uint256).max) _revert(NotCompatibleWithSpotMints.selector);
        uint256 start = _startTokenId();
        uint256 stop = _nextTokenId();
        uint256[] memory tokenIds;
        if (start != stop) tokenIds = _tokensOfOwnerIn(owner, start, stop);
        return tokenIds;
    }

    /**
     * @dev Helper function for returning an array of token IDs owned by `owner`.
     *
     * Note that this function is optimized for smaller bytecode size over runtime gas,
     * since it is meant to be called off-chain.
     */
    function _tokensOfOwnerIn(
        address owner,
        uint256 start,
        uint256 stop
    ) private view returns (uint256[] memory tokenIds) {
        unchecked {
            if (start >= stop) _revert(InvalidQueryRange.selector);
            // Set `start = max(start, _startTokenId())`.
            if (start < _startTokenId()) start = _startTokenId();
            uint256 nextTokenId = _nextTokenId();
            // If spot mints are enabled, scan all the way until the specified `stop`.
            uint256 stopLimit = _sequentialUpTo() != type(uint256).max ? stop : nextTokenId;
            // Set `stop = min(stop, stopLimit)`.
            if (stop >= stopLimit) stop = stopLimit;
            // Number of tokens to scan.
            uint256 tokenIdsMaxLength = balanceOf(owner);
            // Set `tokenIdsMaxLength` to zero if the range contains no tokens.
            if (start >= stop) tokenIdsMaxLength = 0;
            // If there are one or more tokens to scan.
            if (tokenIdsMaxLength != 0) {
                // Set `tokenIdsMaxLength = min(balanceOf(owner), tokenIdsMaxLength)`.
                if (stop - start <= tokenIdsMaxLength) tokenIdsMaxLength = stop - start;
                uint256 m; // Start of available memory.
                assembly {
                    // Grab the free memory pointer.
                    tokenIds := mload(0x40)
                    // Allocate one word for the length, and `tokenIdsMaxLength` words
                    // for the data. `shl(5, x)` is equivalent to `mul(32, x)`.
                    m := add(tokenIds, shl(5, add(tokenIdsMaxLength, 1)))
                    mstore(0x40, m)
                }
                // We need to call `explicitOwnershipOf(start)`,
                // because the slot at `start` may not be initialized.
                TokenOwnership memory ownership = explicitOwnershipOf(start);
                address currOwnershipAddr;
                // If the starting slot exists (i.e. not burned),
                // initialize `currOwnershipAddr`.
                // `ownership.address` will not be zero,
                // as `start` is clamped to the valid token ID range.
                if (!ownership.burned) currOwnershipAddr = ownership.addr;
                uint256 tokenIdsIdx;
                // Use a do-while, which is slightly more efficient for this case,
                // as the array will at least contain one element.
                do {
                    if (_sequentialUpTo() != type(uint256).max) {
                        // Skip the remaining unused sequential slots.
                        if (start == nextTokenId) start = _sequentialUpTo() + 1;
                        // Reset `currOwnershipAddr`, as each spot-minted token is a batch of one.
                        if (start > _sequentialUpTo()) currOwnershipAddr = address(0);
                    }
                    ownership = _ownershipAt(start); // This implicitly allocates memory.
                    assembly {
                        switch mload(add(ownership, 0x40))
                        // if `ownership.burned == false`.
                        case 0 {
                            // if `ownership.addr != address(0)`.
                            // The `addr` already has it's upper 96 bits clearned,
                            // since it is written to memory with regular Solidity.
                            if mload(ownership) {
                                currOwnershipAddr := mload(ownership)
                            }
                            // if `currOwnershipAddr == owner`.
                            // The `shl(96, x)` is to make the comparison agnostic to any
                            // dirty upper 96 bits in `owner`.
                            if iszero(shl(96, xor(currOwnershipAddr, owner))) {
                                tokenIdsIdx := add(tokenIdsIdx, 1)
                                mstore(add(tokenIds, shl(5, tokenIdsIdx)), start)
                            }
                        }
                        // Otherwise, reset `currOwnershipAddr`.
                        // This handles the case of batch burned tokens
                        // (burned bit of first slot set, remaining slots left uninitialized).
                        default {
                            currOwnershipAddr := 0
                        }
                        start := add(start, 1)
                        // Free temporary memory implicitly allocated for ownership
                        // to avoid quadratic memory expansion costs.
                        mstore(0x40, m)
                    }
                } while (!(start == stop || tokenIdsIdx == tokenIdsMaxLength));
                // Store the length of the array.
                assembly {
                    mstore(tokenIds, tokenIdsIdx)
                }
            }
        }
    }
}
