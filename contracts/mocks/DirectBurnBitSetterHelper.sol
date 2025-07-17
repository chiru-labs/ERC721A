// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.3.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

contract DirectBurnBitSetterHelper {
    function directSetBurnBit(uint256 index) public virtual {
        bytes32 erc721aDiamondStorageSlot = keccak256('openzepplin.contracts.storage.ERC721A');

        // This is `_BITMASK_BURNED` from ERC721A.
        uint256 bitmaskBurned = 1 << 224;
        // We use assembly to directly access the private mapping.
        assembly {
            // The `_packedOwnerships` mapping is at slot 4.
            mstore(0x20, 4)
            mstore(0x00, index)
            let ownershipStorageSlot := keccak256(0x00, 0x40)
            sstore(ownershipStorageSlot, or(sload(ownershipStorageSlot), bitmaskBurned))

            // For diamond storage, we'll simply add the offset of the layout struct.
            mstore(0x20, add(erc721aDiamondStorageSlot, 4))
            mstore(0x00, index)
            ownershipStorageSlot := keccak256(0x00, 0x40)
            sstore(ownershipStorageSlot, or(sload(ownershipStorageSlot), bitmaskBurned))
        }
    }
}
