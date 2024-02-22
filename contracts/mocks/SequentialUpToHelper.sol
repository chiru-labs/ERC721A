// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creators: Chiru Labs

pragma solidity ^0.8.4;

/**
 * This Helper is used to return a dynamic value in the overridden _sequentialUpTo() function.
 * Extending this Helper before the ERC721A contract give us access to the herein set `sequentialUpTo`
 * to be returned by the overridden `_sequentialUpTo()` function of ERC721A in the ERC721ASpot mocks.
 */
contract SequentialUpToHelper {
    // `bytes4(keccak256('sequentialUpTo'))`.
    uint256 private constant SEQUENTIAL_UP_TO_STORAGE_SLOT = 0x9638c59e;

    constructor(uint256 sequentialUpTo_) {
        _initializeSequentialUpTo(sequentialUpTo_);
    }

    function sequentialUpTo() public view returns (uint256 result) {
        assembly {
            result := sload(SEQUENTIAL_UP_TO_STORAGE_SLOT)
        }
    }

    function _initializeSequentialUpTo(uint256 value) private {
        // We use assembly to directly set the `sequentialUpTo` in storage so that
        // inheriting this class won't affect the layout of other storage slots.
        assembly {
            sstore(SEQUENTIAL_UP_TO_STORAGE_SLOT, value)
        }
    }
}
