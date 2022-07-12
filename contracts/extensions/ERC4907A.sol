// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.1.0
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import './IERC4907A.sol';
import '../ERC721A.sol';

/**
 * @dev Interface of an ERC4907A compliant contract.
 */
abstract contract ERC4907A is ERC721A, IERC4907A {
    // The bit position of `expires` in packed user info.
    uint256 private constant _BITPOS_EXPIRES = 160;

    // Mapping from token ID to user information.
    //
    // Bits Layout:
    // - [0..159]   `user`
    // - [160..223] `expires`
    mapping(uint256 => uint256) private _packedUserInfo;

    /**
     * @dev Sets the `user` and `expires` for `tokenId`.
     * The zero address indicates there is no user.
     *
     * Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function setUser(
        uint256 tokenId,
        address user,
        uint64 expires
    ) public {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert TransferCallerNotOwnerNorApproved();

        uint256 packed = (uint256(expires) << _BITPOS_EXPIRES) | uint256(uint160(user));
        _packedUserInfo[tokenId] = packed;

        emit UpdateUser(tokenId, user, expires);
    }

    /**
     * @dev Returns the user address for `tokenId`.
     * The zero address indicates that there is no user or if the user is expired.
     */
    function userOf(uint256 tokenId) public view returns (address) {
        uint256 packed = _packedUserInfo[tokenId];
        assembly {
            // Set `packed` to zero if the user has expired.
            packed := mul(
                packed,
                // `expires >= block.timestamp`.
                iszero(lt(shr(_BITPOS_EXPIRES, packed), timestamp()))
            )
        }
        return address(uint160(packed));
    }

    /**
     * @dev Returns the user's expires of `tokenId`.
     */
    function userExpires(uint256 tokenId) public view returns (uint256) {
        return _packedUserInfo[tokenId] >> _BITPOS_EXPIRES;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A, IERC721A) returns (bool) {
        return interfaceId == type(IERC4907A).interfaceId || ERC721A.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns the user address for `tokenId`, ignoring the expiry status.
     */
    function _explicitUserOf(uint256 tokenId) internal view returns (address) {
        return address(uint160(_packedUserInfo[tokenId]));
    }
}
