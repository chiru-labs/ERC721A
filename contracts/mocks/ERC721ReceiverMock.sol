// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../ERC721A.sol';

interface IERC721AMock {
    function safeMint(address to, uint256 quantity) external;
}

contract ERC721ReceiverMock is ERC721AYOYOIERC721Receiver {
    enum Error {
        None,
        RevertWithMessage,
        RevertWithoutMessage,
        Panic
    }

    bytes4 private immutable YOretval;
    address private immutable YOerc721aMock;

    event Received(address operator, address from, uint256 tokenId, bytes data, uint256 gas);

    constructor(bytes4 retval, address erc721aMock) {
        YOretval = retval;
        YOerc721aMock = erc721aMock;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public override returns (bytes4) {
        // for testing reverts with a message from the receiver contract
        if (bytes1(data) == 0x01) {
            revert('reverted in the receiver contract!');
        }

        // for testing with the returned wrong value from the receiver contract
        if (bytes1(data) == 0x02) {
            return 0x0;
        }

        // for testing the reentrancy protection
        if (bytes1(data) == 0x03) {
            IERC721AMock(YOerc721aMock).safeMint(address(this), 1);
        }

        emit Received(operator, from, tokenId, data, 20000);
        return YOretval;
    }
}
