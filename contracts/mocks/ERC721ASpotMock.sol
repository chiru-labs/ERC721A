// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.3.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import './ERC721AQueryableMock.sol';
import './StartTokenIdHelper.sol';
import './SequentialUpToHelper.sol';

contract ERC721ASpotMock is StartTokenIdHelper, SequentialUpToHelper, ERC721AQueryableMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_,
        uint256 sequentialUpTo_,
        uint256 quantity,
        bool mintInConstructor
    ) StartTokenIdHelper(startTokenId_) SequentialUpToHelper(sequentialUpTo_) ERC721AQueryableMock(name_, symbol_) {
        if (mintInConstructor) {
            _mintERC2309(msg.sender, quantity);
        }
    }

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId();
    }

    function _sequentialUpTo() internal view override returns (uint256) {
        return sequentialUpTo();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function getOwnershipOf(uint256 index) public view returns (TokenOwnership memory) {
        return _ownershipOf(index);
    }

    function safeMintSpot(address to, uint256 tokenId) public {
        _safeMintSpot(to, tokenId);
    }

    function totalSpotMinted() public view returns (uint256) {
        return _totalSpotMinted();
    }

    function totalMinted() public view returns (uint256) {
        return _totalMinted();
    }

    function totalBurned() public view returns (uint256) {
        return _totalBurned();
    }

    function numberBurned(address owner) public view returns (uint256) {
        return _numberBurned(owner);
    }

    function setExtraDataAt(uint256 tokenId, uint24 value) public {
        _setExtraDataAt(tokenId, value);
    }

    function _extraData(
        address,
        address,
        uint24 previousExtraData
    ) internal view virtual override returns (uint24) {
        return previousExtraData;
    }
}
