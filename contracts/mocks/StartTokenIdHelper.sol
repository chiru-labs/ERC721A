// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creators: Chiru Labs

pragma solidity ^0.8.4;

/**
 * This Helper is used to return a dynamic value in the overridden _startTokenId() function.
 * Extending this Helper before the ERC721A contract give us access to the herein set `startTokenId`
 * to be returned by the overridden `_startTokenId()` function of ERC721A in the ERC721AStartTokenId mocks.
 */
contract StartTokenIdHelper {
    // `bytes4(keccak256('startTokenId'))`.
    uint256 private constant _START_TOKEN_ID_STORAGE_SLOT = 0x28f75032;

    constructor(uint256 startTokenId_) {
        _initializeStartTokenId(startTokenId_);
    }

    function startTokenId() public view returns (uint256 result) {
        assembly {
            result := sload(_START_TOKEN_ID_STORAGE_SLOT)
        }
    }

    function _initializeStartTokenId(uint256 value) private {
        // We use assembly to directly set the `startTokenId` in storage so that
        // inheriting this class won't affect the layout of other storage slots.
        assembly {
            sstore(_START_TOKEN_ID_STORAGE_SLOT, value)
        }
    }
}
