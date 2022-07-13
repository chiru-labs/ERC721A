// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.1.0
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import './IERC4907A.sol';
import '../ERC721A.sol';

/**
 * @dev ERC4907 compliant extension of ERC721A.
 *
 * The ERC4907 standard https://eips.ethereum.org/EIPS/eip-4907[ERC4907] allows
 * owners and authorized addresses to add a time-limited role
 * with restricted permissions to ERC721 tokens.
 */
abstract contract ERC4907A is ERC721A, IERC4907A {
    // The bit position of `expires` in packed user info.
    uint256 private constant _BITPOS_EXPIRES = 160;

    // The mask of the lower 160 bits for addresses.
    uint256 private constant _BITMASK_ADDRESS = (1 << 160) - 1;

    // Mapping from token ID to user info.
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
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert SetUserCallerNotOwnerNorApproved();

        _packedUserInfo[tokenId] = (uint256(expires) << _BITPOS_EXPIRES) | uint256(uint160(user));

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
            // Equivalent to `packed *= !(block.timestamp > expires) ? 1 : 0`.
            packed := mul(
                packed,
                iszero(gt(timestamp(), shr(_BITPOS_EXPIRES, packed)))
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
        // The interface ID for ERC4907 is `0xad092b5c`.
        // See: https://eips.ethereum.org/EIPS/eip-4907
        return super.supportsInterface(interfaceId) || interfaceId == 0xad092b5c;
    }

    /**
     * @dev Returns the user address for `tokenId`, ignoring the expiry status.
     */
    function _explicitUserOf(uint256 tokenId) internal view returns (address) {
        return address(uint160(_packedUserInfo[tokenId]));
    }

    /**
     * @dev Overrides the `_beforeTokenTransfers` hook to clear the user info upon transfer.
     */
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);

        bool mayNeedClearing;
        // For branchless boolean. Saves 60+ gas.
        assembly {
            // Equivalent to `quantity == 1 && !(from == address(0) || from == to)`.
            // We need to mask the addresses with `_BITMASK_ADDRESS` to
            // clear any non-zero excess upper bits.
            mayNeedClearing := and(
                eq(quantity, 1),
                iszero(or(
                    // Whether it is a mint (i.e. `from == address(0)`).
                    iszero(and(from, _BITMASK_ADDRESS)),
                    // Whether the owner is unchanged (i.e. `from == to`).
                    eq(and(from, _BITMASK_ADDRESS), and(to, _BITMASK_ADDRESS))
                ))
            )
        }

        if (mayNeedClearing)
            if (_packedUserInfo[startTokenId] != 0) {
                delete _packedUserInfo[startTokenId];
                emit UpdateUser(startTokenId, address(0), 0);
            }
    }
}
