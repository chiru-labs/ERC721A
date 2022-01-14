pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../ERC721A.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ERC721AMock is ERC721A {

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxBatchSize_
    ) ERC721A(name_, symbol_, maxBatchSize_) {}

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public {
        _safeMint(to, tokenId, _data);
    }
}
