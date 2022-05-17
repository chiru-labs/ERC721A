// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "forge-std/Test.sol";
import "../Contracts/ERC721A.sol";

contract ContractERC721ATest is Test {
    ERC721A erc721a;
    
    function setUp() public {
        erc721a = new ERC721A("Azuki","AZUKI");
    }

    //Check the NFT Name 
    function testname() public {
        assertEq("Azuki",erc721a.name());
    }

    function testERC165Support() public {
        // supports the IERC721
        assert(erc721a.supportsInterface(bytes4(0x80ac58cd)));
        // supports the 
        assert(erc721a.supportsInterface(bytes4(0x5b5e139f)));

    }

}
