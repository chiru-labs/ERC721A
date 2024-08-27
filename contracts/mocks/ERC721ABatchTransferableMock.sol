// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.2.3
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../extensions/ERC721ABatchTransferable.sol';

contract ERC721ABatchTransferableMock is ERC721ABatchTransferable {
    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function getOwnershipAt(uint256 index) public view returns (TokenOwnership memory) {
        return _ownershipAt(index);
    }

    function initializeOwnershipAt(uint256 index) public {
        _initializeOwnershipAt(index);
    }

    function _extraData(
        address,
        address,
        uint24 previousExtraData
    ) internal view virtual override returns (uint24) {
        return previousExtraData;
    }

    function setExtraDataAt(uint256 index, uint24 extraData) public {
        _setExtraDataAt(index, extraData);
    }

    function batchTransferFromUnoptimized(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public {
        unchecked {
            for (uint256 i; i != tokenIds.length; ++i) {
                transferFrom(from, to, tokenIds[i]);
            }
        }
    }

    function directBatchTransferFrom(
        address by,
        address from,
        address to,
        uint256[] memory tokenIds
    ) public {
        _batchTransferFrom(by, from, to, tokenIds);
    }

    function directBatchTransferFrom(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public {
        _batchTransferFrom(from, to, tokenIds);
    }
}
