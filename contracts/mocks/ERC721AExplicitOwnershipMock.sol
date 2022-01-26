// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.0;

import "../extensions/ERC721AExplicitOwnership.sol";

contract ERC721AExplicitOwnershipMock is ERC721AExplicitOwnership {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxBatchSize_
    ) ERC721A(name_, symbol_, maxBatchSize_) {}

    function setOwnersExplicit(uint256 quantity) public {
        _setOwnersExplicit(quantity);
    }
}