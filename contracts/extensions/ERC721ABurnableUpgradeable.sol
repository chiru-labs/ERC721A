// SPDX-License-Identifier: MIT
// Creator: Chiru Labs
// Made upgradeable by: Xenum Technologies (xenum.io)

pragma solidity ^0.8.4;

import '../ERC721AUpgradeable.sol';

/**
 * @title ERC721AUpgradeable Burnable Token
 * @dev ERC721AUpgradeable Token that can be irreversibly burned (destroyed).
 */
abstract contract ERC721ABurnableUpgradeable is ERC721AUpgradeable {

	function __ERC721ABurnable_init(string memory name_, string memory symbol_) public virtual onlyInitializing {
		__ERC721A_init(name_, symbol_);
	}

	function __ERC721Burnable_init_unchaind() public virtual onlyInitializing {
	}

    /**
     * @dev Burns `tokenId`. See {ERC721A-_burn}.
     *
     * Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function burn(uint256 tokenId) public virtual {
        TokenOwnership memory prevOwnership = ownershipOf(tokenId);

        bool isApprovedOrOwner = (_msgSender() == prevOwnership.addr ||
            isApprovedForAll(prevOwnership.addr, _msgSender()) ||
            getApproved(tokenId) == _msgSender());

        if (!isApprovedOrOwner) revert TransferCallerNotOwnerNorApproved();

        _burn(tokenId);
    }
}
