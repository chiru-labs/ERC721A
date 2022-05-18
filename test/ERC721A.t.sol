// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {ERC721AMock} from "../Contracts/mocks/ERC721AMock.sol";
import {ERC721A__IERC721Receiver} from "../Contracts/ERC721A.sol";

contract ERC721ARecipient is ERC721A__IERC721Receiver {
    address public operator;
    address public from;
    uint256 public id;
    bytes public data;

    function onERC721Received(
        address _operator,
        address _from,
        uint256 _id,
        bytes calldata _data
    ) public virtual override returns (bytes4) {
        operator = _operator;
        from = _from;
        id = _id;
        data = _data;

        return ERC721A__IERC721Receiver.onERC721Received.selector;
    }
}

contract RevertingERC721Recipient is ERC721A__IERC721Receiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public virtual override returns (bytes4) {
        revert(string(abi.encodePacked(ERC721A__IERC721Receiver.onERC721Received.selector)));
    }
}

contract WrongReturnDataERC721Recipient is ERC721A__IERC721Receiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public virtual override returns (bytes4) {
        return 0xCAFEBEEF;
    }
}

contract NonERC721Recipient {}

contract ERC721ATest is Test {
    ERC721AMock erc721a;
    address minter = vm.addr(1);
    address alice = vm.addr(2);

    function setUp() public {
        erc721a = new ERC721AMock("Azuki","AZUKI");
    }

    //Check the NFT Name 
    function testName() public {
        assertEq("Azuki",erc721a.name());
    }
    
    //check the NFT Symbol
    function testSymol() public {
        assertEq("AZUKI",erc721a.symbol());
    }

    function testERC165Support() view public {
        // support the IERC721
        assert(erc721a.supportsInterface(bytes4(0x80ac58cd)));
        // support the ERC721Metadata
        assert(erc721a.supportsInterface(bytes4(0x5b5e139f)));
    }

    function testMint() public {
        assertEq(erc721a.totalSupply(), 0);
        erc721a.mint(minter, 2);    // mint 2 NFTs
        erc721a.mint(alice, 5);    // mint 5 NFTs
        assertEq(erc721a.totalSupply(), 7);      
        assertEq(erc721a.balanceOf(minter),2);  // check the balance of minter  
        assertEq(erc721a.balanceOf(alice),5);  // check the balance of alice
    }

    function testBurn() public {
        erc721a.mint(minter, 1);    // mint 5 NFTs
        erc721a.burn(0, false);
        assertEq(erc721a.balanceOf(minter), 0);
    }

    function testApprove() public {
        erc721a.mint(address(this), 1);    // mint 1 NFT
        erc721a.approve(alice,0);
        assertEq(erc721a.getApproved(0),alice);
    }

    function testApproveBurn() public {
        erc721a.mint(address(this), 1);    // mint 1 NFT
        erc721a.approve(alice,0);
        vm.prank(alice);
        erc721a.burn(0, true);
        assertEq(erc721a.totalSupply(), 0);
    }

    function testApproveAll() public {
        erc721a.setApprovalForAll(alice, true); // set alice to approve all NFTs
        assert(erc721a.isApprovedForAll(address(this), alice));
    }

    function testTransferFrom() public {
        erc721a.mint(address(this), 1);    // mint 1 NFT
        erc721a.approve(alice,0);
        vm.startPrank(alice);
        erc721a.transferFrom(address(this), alice, 0);
        assertEq(erc721a.balanceOf(address(this)), 0);
        assertEq(erc721a.balanceOf(alice), 1);
    }

    function testTransferFromSelf() public {
        erc721a.mint(address(this), 1);    // mint 1 NFT
        erc721a.transferFrom(address(this), alice, 0);
        assertEq(erc721a.getApproved(0), address(0));  // check the approved address
        assertEq(erc721a.ownerOf(0), alice);  // check the owner
        assertEq(erc721a.balanceOf(address(this)), 0);
        assertEq(erc721a.balanceOf(alice), 1);
    }

    function testTransferFromApproveAll() public {
        erc721a.mint(alice, 1);    // mint 1 NFT
        vm.prank(alice);
        erc721a.setApprovalForAll(address(this), true);

        erc721a.transferFrom(alice, address(this), 0);
        assertEq(erc721a.getApproved(0), address(0));  // check the approved address
        assertEq(erc721a.balanceOf(address(this)), 1);
        assertEq(erc721a.balanceOf(alice), 0);
    }

    function testSafeTransferFromToEOA() public {
        erc721a.mint(minter, 1);    // mint 1 NFT
        vm.prank(minter);
        erc721a.setApprovalForAll(address(this), true);
        erc721a.safeTransferFrom(minter, alice , 0);
        assertEq(erc721a.getApproved(0),address(0));
        assertEq(erc721a.ownerOf(0), alice);
        assertEq(erc721a.balanceOf(minter), 0);
        assertEq(erc721a.balanceOf(alice), 1);
    }

    function testSafeTransferFromToERC721Recipient() public {
        erc721a.mint(minter, 1);    // mint 1 NFT
        vm.prank(minter);
        erc721a.setApprovalForAll(address(this), true);
        ERC721ARecipient recipient = new ERC721ARecipient();
        erc721a.safeTransferFrom(minter, address(recipient), 0);
        assertEq(erc721a.getApproved(0),address(0));
        assertEq(erc721a.ownerOf(0), address(recipient));
   
        assertEq(recipient.operator(), address(this));
        assertEq(recipient.from(), minter);
        assertEq(recipient.id(), 0);
        assertEq(recipient.data(), "");
    }
    
    function testSafeTransferFromToERC721RecipientWithData() public { 
        erc721a.mint(minter, 1);    // mint 1 NFT
        vm.prank(minter);
        erc721a.setApprovalForAll(address(this), true);
        ERC721ARecipient recipient = new ERC721ARecipient();
        erc721a.safeTransferFrom(minter, address(recipient), 0 , "Transfer 0 NFTs");
        assertEq(erc721a.getApproved(0),address(0));
        assertEq(erc721a.ownerOf(0), address(recipient));
   
        assertEq(recipient.operator(), address(this));
        assertEq(recipient.from(), minter);
        assertEq(recipient.id(), 0);
        assertEq(recipient.data(), "Transfer 0 NFTs");
    }

    function testSafeMintWithData() public {
        assertEq(erc721a.totalSupply(), 0);
        erc721a.safeMint(minter, 2, "Hello"); // mint 2 NFTs with data
        assertEq(erc721a.totalSupply(), 2);
        assertEq(erc721a.balanceOf(minter),2);  // check the balance of minter
    }

    function testSafeMintWithDataAndReceiver() public {
        ERC721ARecipient to = new ERC721ARecipient();
        assertEq(erc721a.totalSupply(), 0);
        erc721a.safeMint(address(to), 2, "Hello"); // mint 2 NFTs with data and receiver
        assertEq(erc721a.totalSupply(), 2);
    }

    function testNumberMinted() public { 
        assertEq(erc721a.numberMinted(minter), 0);
        erc721a.safeMint(minter, 2);    // mint 2 NFTs
        assertEq(erc721a.numberMinted(minter),2);  // check the number of NFTs minted by minter
        erc721a.safeMint(alice, 10);     // mint 10 NFTs
        assertEq(erc721a.numberMinted(alice),10);  // check the number of NFTs minted by alice
    }

    function testNumberMintedWithData() public { 
        assertEq(erc721a.numberMinted(minter), 0);
        erc721a.safeMint(minter, 2, "Hello"); // mint 2 NFTs with data
        assertEq(erc721a.numberMinted(minter),2);  // check the number of NFTs minted by minter
    }

    function testNumberMintedWithDataAndReceiver() public { 
        ERC721ARecipient to = new ERC721ARecipient();
        assertEq(erc721a.numberMinted(address(to)), 0);
        erc721a.safeMint(address(to), 2, "Hello"); // mint 2 NFTs with data and receiver
        assertEq(erc721a.numberMinted(address(to)),2);  // check the number of NFTs minted by minter
    }

    function testBurnWithNonApprovalCheck() public {
        erc721a.mint(minter, 2);    // mint 2 NFTs
        assertEq(erc721a.balanceOf(minter),2);   // check the balance of minter
        erc721a.burn(1, false);    // burn 1 NFT
        assertEq(erc721a.balanceOf(minter),1);   // check the balance of minter
    }

    function testBurnWithApprovalCheck() public {
        vm.startPrank(minter);
        erc721a.mint(minter, 2);    // mint 2 NFTs
        assertEq(erc721a.balanceOf(minter),2);   // check the balance of minter
        erc721a.burn(0, true);    // burn 1 NFT
        assertEq(erc721a.balanceOf(minter),1);   // check the balance of minter
    }

    function testBurnWithNonEOAAccountAndWithApprovalCheck() public {
        vm.startPrank(minter);
        erc721a.mint(minter, 2);    // mint 2 NFTs
        erc721a.setApprovalForAll(address(this), true);
        vm.stopPrank();
        vm.prank(address(this));
        erc721a.burn(1, true);    // burn 1 NFT
    }

    function testSetAux() public {
        assertEq(erc721a.getAux(minter), 0);
        erc721a.setAux(minter, 2);
        erc721a.setAux(alice,type(uint64).max);
        assertEq(erc721a.getAux(minter), 2);
        assertEq(erc721a.getAux(alice), type(uint64).max);
    }

    function testToString() public {
        assertEq(erc721a.toString(0), "0");
        assertEq(erc721a.toString(15545456), "15545456");
    }

    function testGetOwnershipAt() public {
        erc721a.mint(minter, 2);    // mint 2 NFTs
        erc721a.mint(alice, 5) ;   // mint 5 NFTs
        erc721a.mint(minter, 6) ;
        assertEq(erc721a.getOwnershipAt(0).addr, minter);
        assertEq(erc721a.getOwnershipAt(2).addr, alice);
        assertEq(erc721a.getOwnershipAt(7).addr, minter);
    }

    function testOwnerOf() public {
        erc721a.mint(minter, 2);    // mint 2 NFTs
        erc721a.mint(alice, 5) ;   // mint 5 NFTs
        erc721a.mint(minter, 6) ;
        for (uint i =0 ; i < erc721a.totalSupply(); ++i ) {
        if (i < 2)
        assertEq(erc721a.getOwnershipAt(0).addr, minter);
        else if (i < 7)
        assertEq(erc721a.getOwnershipAt(2).addr, alice);
        else
        assertEq(erc721a.getOwnershipAt(7).addr, minter);
        }
    }

    function testBalanceOf() public {
        erc721a.mint(minter, 2);    // mint 2 NFTs
        assertEq(erc721a.balanceOf(minter),2);
        erc721a.mint(alice, 5) ;   // mint 5 NFTs
        erc721a.mint(minter, 6) ;
        assertEq(erc721a.balanceOf(alice),5);
        assertEq(erc721a.balanceOf(minter),8);
    }

    function testFailERC165Support() public {
        // does not support ERC721Enumerable
        assertEq(erc721a.supportsInterface(bytes4(0x780e9d63)), true);
        // does not support random bytes4 value
        assertEq(erc721a.supportsInterface(bytes4(0x00004548)), true);
    }

    function testFailMintToZero() public {
        erc721a.mint(address(0), 1);
    }

    function testFailMintZeroQuantity() public {
        erc721a.mint(minter, 0);
    }

    function testFailSafeMintToNonERC721Recipient() public {
         NonERC721Recipient to = new NonERC721Recipient();
        erc721a.safeMint(address(to), 2); // mint 2 NFTs to 
    }

    function testFailSafeMintWithDataAndReceiverAndNonERC721Recipient() public {
        NonERC721Recipient to = new NonERC721Recipient();
        erc721a.safeMint(address(to), 2, "Hello"); // mint 2 NFTs to with data and receiver
    }

    function testFailSafeMintToERC721RecipientWithWrongReturnData() public {
       WrongReturnDataERC721Recipient to = new WrongReturnDataERC721Recipient();
       erc721a.safeMint(address(to), 2); // mint 2 NFTs to with data and receiver
    }

    function testFailSafeMintWithDataAndReceiverAndWrongReturnData() public {
        WrongReturnDataERC721Recipient to = new WrongReturnDataERC721Recipient();
        erc721a.safeMint(address(to), 2, "Hello"); // mint 2 NFTs with data and receiver 
    }

    function testFailSafeMintToRevertingERC721Recipient() public {
        RevertingERC721Recipient to = new RevertingERC721Recipient();
        erc721a.safeMint(address(to), 2); // mint 2 NFTs to with data and receiver
    }

    function testFailSafeMintWithDataAndReceiverAndRevertingERC721Recipient() public {
        RevertingERC721Recipient to = new RevertingERC721Recipient();
        erc721a.safeMint(address(to), 2, "Hello"); // mint 2 NFTs with data and receiver
    }

    function testFailBurnUnMinted() public {
        erc721a.burn(1, false);
    }

    function testFailDoubleBurn() public {
        vm.startPrank(minter);
        erc721a.mint(minter, 1);    // mint 1 NFTs
        erc721a.burn(0 , false);    // burn 1 NFT
        erc721a.burn(0 , false);    // duplicate burn
    }

    function testFailBurnWithNonEOAAccountAndWithApprovalCheck() public {
        erc721a.mint(minter, 1);    // mint 1 NFTs
        erc721a.burn(0 , true);    // burn 1 NFT
    }

    function testFailBurnWithApprovalCheckAndWithEOAAccount() public {
        vm.prank(minter);
        erc721a.mint(minter, 1);    // mint 1 NFTs
        vm.prank(alice);
        erc721a.burn(0 , true);    // burn 1 NFT
    }

    function testFailApproveUnMinted() public {
        erc721a.approve(minter,1);
    }

    function testFailApproveUnAuthorized() public {
        erc721a.mint(alice,1);
        erc721a.approve(address(this),1);
    }

    function testFailTransferFromUnOwned() public {
        erc721a.transferFrom(address(this),minter,0);
    }

    function testFailTransferFromWrongFrom() public {
        erc721a.mint(alice,1);
        erc721a.transferFrom(minter,address(this),0);
    }

    function testFailTansferFromToZero() public {
        erc721a.mint(alice,1);
        erc721a.transferFrom(alice,address(0),0);
    }

    function testFailTransferFromNotOnwer() public {
        erc721a.mint(alice,1);
        erc721a.transferFrom(alice,minter,0);
    }

    function testFailSafeTransferFromToNonERC721Recipient() public {
        erc721a.mint(alice,1);
        vm.startPrank(alice);
        NonERC721Recipient to = new NonERC721Recipient();
        erc721a.safeTransferFrom(alice,address(to),0);
    }

    function testFailSafeTransferFromToNonERC721RecipientWithData() public {
        erc721a.mint(alice,1);
        vm.startPrank(alice);
        NonERC721Recipient to = new NonERC721Recipient();
        erc721a.safeTransferFrom(alice,address(to),0,"data");
    }

    function testFailSafeTransferFormToRevertingERC721Recipient() public {
        erc721a.mint(alice,1);
        vm.startPrank(alice);
        RevertingERC721Recipient to = new RevertingERC721Recipient();
        erc721a.safeTransferFrom(alice,address(to),0);
    }

    function testFailSafeTransferFormToRevertingERC721RecipientWithData() public {
        erc721a.mint(alice,1);
        vm.startPrank(alice);
        RevertingERC721Recipient to = new RevertingERC721Recipient();
        erc721a.safeTransferFrom(alice,address(to),0,"data");
    }

    function testFailSafeTransferFromToERC721RecipientWithWrongReturnData() public {
        erc721a.mint(alice,1);
        vm.startPrank(alice);
        WrongReturnDataERC721Recipient to = new WrongReturnDataERC721Recipient();
        erc721a.safeTransferFrom(alice,address(to),0);
    }

    function testFailSafeTransferFromToERC721RecipientWithWrongReturnDataWithData() public {
        erc721a.mint(alice,1);
        vm.startPrank(alice);
        WrongReturnDataERC721Recipient to = new WrongReturnDataERC721Recipient();
        erc721a.safeTransferFrom(alice,address(to),0,"data");
    }
    
    function testFailBalanceOfZeroAddress() public view {
        erc721a.balanceOf(address(0));
    }

    function testFailOwnerOfUnminted() public view {
        erc721a.ownerOf(1337);
    }

    /*************************************************************/
    /*                       Fuzz Testing                        */
    /*************************************************************/

    function testFuzzMetadata(string memory name, string memory symbol) public {
       ERC721AMock mock = new ERC721AMock(name, symbol);
       assertEq(mock.name(), name);
       assertEq(mock.symbol(), symbol);
    }
    
    // use uint8 instead of uint256 becuase uint256 too large input values so in tesing consume more time (You can change as per your Requirement)
    function testFuzzMint(address _to, uint8 _amount) public {
        if(_to == address(0)) {
            _to = alice;
        }
        if(_amount == 0) {
            _amount = 1;
        }

        erc721a.mint(_to, uint256(_amount));
        assertEq(erc721a.balanceOf(_to), uint256(_amount));
    }

    // uint256 too time consuming so I use the uint8 (you can use as per your requirement)
    function testFuzzBurn(address _to, uint8 id) public {
        uint8 amount;
        if(_to == address(0))
            _to = alice;
        if(id == 0)
            amount = 1;
        else
            amount = id;
        vm.startPrank(_to);
        erc721a.mint(_to, uint256(amount));

        for (uint i = 0; i < amount; ++i) {
            erc721a.burn(uint256(i),false);
            assertEq(erc721a.balanceOf(_to),erc721a.totalSupply());
        }
    }

    function testFuzzApprove(address _to, uint8 id) public {
        if(_to == address(0))
            _to = minter;
        if(id == 0)
            id = 1;

        vm.startPrank(_to);
        erc721a.mint(_to,id);

        erc721a.approve(alice, id-1);
        assertEq(erc721a.getApproved(id-1),alice);
    }
    
    function testFuzzApproveBurn(address _to, uint8 id) public {
        if(_to == address(0))
            _to = minter;
        if(id == 0)
            id = 1;

        erc721a.mint(_to,uint256(id));
        
        for (uint i =0 ; i < id; ++i){
            vm.prank(_to);
            erc721a.approve(address(this), i);
            erc721a.burn(i, true);
            assertEq(erc721a.balanceOf(_to),erc721a.totalSupply());

        }
    }

    function testFuzzApproveAll(address _to, bool approved) public {
        erc721a.setApprovalForAll(_to, approved);
        assertEq(erc721a.isApprovedForAll(address(this), _to),approved);
    }

    function testFuzzTransferFrom(address _from,address _to , uint8 id) public {
        if(_to == address(0) || _to == _from)
            _to = minter;
        if(_from == address(0))
            _from = alice;
        if(id == 0)
            id = 1;
        erc721a.mint(_from,id);
        vm.prank(_from);
        erc721a.setApprovalForAll(address(this),true);

        uint balance = erc721a.balanceOf(_from);
        for (uint i = 0 ; i < id ; ++i) {
            erc721a.transferFrom(_from, _to, i);
            assertEq(erc721a.getApproved(i),adress(0));
            assertEq(erc721a.balanceOf(_from),--balance);
            assertEq(erc721a.balanceOf(_to),i+1);
        }
    }

    function testFuzzTransferFromSelf(address _to, uint8 id) public {
        if(_to == address(0) || _to == address(this))
            _to = alice;
        if (id == 0)
            id = 1;
        erc721a.mint(address(this),id);

        uint balance = erc721a.balanceOf(address(this));

        for (uint i = 0 ; i < id ; ++i) {
            erc721a.transferFrom(address(this), _to, i);
            ssertEq(erc721a.getApproved(i),address(0));
            assertEq(erc721a.balanceOf(address(this)),--balance);
            assertEq(erc721a.balanceOf(_to),i+1);
        }
    }
    
}

