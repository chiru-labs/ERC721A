// SPDX-License-Identifier: MIT
// Creators: Xenum Technologies
pragma solidity ^0.8.0;

import '../ERC721AUpgradeable.sol';

contract ERC721AUpgradeableMock is ERC721AUpgradeable {
    function initialize(string memory name_, string memory symbol_) public initializer {
        __ERC721A_init(name_, symbol_);
    }

    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }

    function getAux(address owner) public view returns (uint64) {
        return _getAux(owner);
    }

    function setAux(address owner, uint64 aux) public {
        _setAux(owner, aux);
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

    function mint(
        address to,
        uint256 quantity,
        bytes memory _data,
        bool safe
    ) public {
        _mint(to, quantity, _data, safe);
    }
}
