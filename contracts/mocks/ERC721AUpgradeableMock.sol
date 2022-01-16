// SPDX-License-Identifier: MIT
// Created by: cygaar
// Made upgradeable by: MrMcGoats
pragma solidity ^0.8.0;

import "../ERC721AUpgradeable.sol";

contract ERC721AUpgradeableMock is ERC721AUpgradeable {

    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 maxBatchSize_
    ) public virtual override initializer {
		 super.initialize(name_, symbol_, maxBatchSize_);
    }

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 tokenId) external {
        _safeMint(to, tokenId);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) external {
        _safeMint(to, tokenId, _data);
    }
}
