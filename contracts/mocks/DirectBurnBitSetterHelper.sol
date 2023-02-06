// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creators: Chiru Labs

pragma solidity ^0.8.4;

contract DirectBurnBitSetterHelper {
    function directSetBurnBit(uint256 index) public virtual {
        // This is `_BITMASK_BURNED` from ERC721A.
        uint256 bitmaskBurned = 1 << 224;
        // We use assembly to directly access the private mapping.
        // Note that we cannot use this method to test the upgradeable variant
        // as it uses EIP-2535 diamond storage layout.
        assembly {
            // The `_packedOwnerships` mapping is at slot 4.
            mstore(0x20, 4)
            mstore(0x00, index)
            let ownershipStorageSlot := keccak256(0x00, 0x40)
            sstore(ownershipStorageSlot, or(sload(ownershipStorageSlot), bitmaskBurned))
        }
    }
}
