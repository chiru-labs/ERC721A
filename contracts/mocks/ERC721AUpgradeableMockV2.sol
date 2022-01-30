// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '../ERC721AUpgradeable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

contract ERC721AUpgradeableMockV2 is ERC721AUpgradeable {
    function initialize(string memory name_, string memory symbol_) external initializer {
        __ERC721A_init(name_, symbol_);
    }

    function numberMinted(address) public pure returns (uint256) {
        return 42;
    }

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function safeMint(
        address to,
        uint256 quantity,
        bytes memory _data
    ) public {
        _safeMint(to, quantity, _data);
    }
}
