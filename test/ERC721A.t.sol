// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "forge-std/Test.sol";
import "forge-std/Vm.sol";
import "../Contracts/mocks/ERC721AMock.sol";

contract ContractERC721ATest is Test {
    ERC721AMock erc721a;
    address alice = address(0x154664);
    address bob = address(0x1546641);

    function setUp() public {

        erc721a = new ERC721A("Azuki","AZUKI");
    }

    //Check the NFT Name 
    function testname() public {
        assertEq("Azuki",erc721a.name());
    }
    
    //check the NFT Symbol
    function testsymol() public {
        assertEq("AZUKI",erc721a.symbol());
    }

    function testERC165Support() view public {
        // support the IERC721
        assert(erc721a.supportsInterface(bytes4(0x80ac58cd)));
        // support the ERC721Metadata
        assert(erc721a.supportsInterface(bytes4(0x5b5e139f)));
    }

    function testFailERC165Support() public {
        // does not support ERC721Enumerable
        assertEq(erc721a.supportsInterface(bytes4(0x780e9d63)), true);
        // does not support random bytes4 value
        assertEq(erc721a.supportsInterface(bytes4(0x00004548)), true);
    }

    function testmint() public {
        assertEq(erc721a.totalSupply(),0);
        erc721a._safeMint(alice, 1);
    }

    function testFuzzmint() public {
        // erc721a._safeMint(address(0), 1);
        // assertEq(erc721a.totalSupply(),1);
    }



}
