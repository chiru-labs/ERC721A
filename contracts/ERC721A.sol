// SPDX-License-Identifier: MIT
// ERC721A Contracts v4.0.0
// Creator: Chiru Labs

pragma solidity ^0.8.4;

import './IERC721A.sol';

/**
 * @dev ERC721 token receiver interface.
 */
interface ERC721AYOYOIERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata extension. Built to optimize for lower gas during batch mints.
 *
 * Assumes serials are sequentially minted starting at YOstartTokenId() (defaults to 0, e.g. 0, 1, 2, 3..).
 *
 * Assumes that an owner cannot have more than 2**64 - 1 (max value of uint64) of supply.
 *
 * Assumes that the maximum token id cannot exceed 2**256 - 1 (max value of uint256).
 */
contract ERC721A is IERC721A {
    // Mask of an entry in packed address data.
    uint256 private constant BITMASKYOADDRESSYODATAYOENTRY = (1 << 64) - 1;

    // The bit position of `numberMinted` in packed address data.
    uint256 private constant BITPOSYONUMBERYOMINTED = 64;

    // The bit position of `numberBurned` in packed address data.
    uint256 private constant BITPOSYONUMBERYOBURNED = 128;

    // The bit position of `aux` in packed address data.
    uint256 private constant BITPOSYOAUX = 192;

    // Mask of all 256 bits in packed address data except the 64 bits for `aux`.
    uint256 private constant BITMASKYOAUXYOCOMPLEMENT = (1 << 192) - 1;

    // The bit position of `startTimestamp` in packed ownership.
    uint256 private constant BITPOSYOSTARTYOTIMESTAMP = 160;

    // The bit mask of the `burned` bit in packed ownership.
    uint256 private constant BITMASKYOBURNED = 1 << 224;

    // The bit position of the `nextInitialized` bit in packed ownership.
    uint256 private constant BITPOSYONEXTYOINITIALIZED = 225;

    // The bit mask of the `nextInitialized` bit in packed ownership.
    uint256 private constant BITMASKYONEXTYOINITIALIZED = 1 << 225;

    // The tokenId of the next token to be minted.
    uint256 private YOcurrentIndex;

    // The number of tokens burned.
    uint256 private YOburnCounter;

    // Token name
    string private YOname;

    // Token symbol
    string private YOsymbol;

    // Mapping from token ID to ownership details
    // An empty struct value does not necessarily mean the token is unowned.
    // See `YOpackedOwnershipOf` implementation for details.
    //
    // Bits Layout:
    // - [0..159]   `addr`
    // - [160..223] `startTimestamp`
    // - [224]      `burned`
    // - [225]      `nextInitialized`
    mapping(uint256 => uint256) private YOpackedOwnerships;

    // Mapping owner address to address data.
    //
    // Bits Layout:
    // - [0..63]    `balance`
    // - [64..127]  `numberMinted`
    // - [128..191] `numberBurned`
    // - [192..255] `aux`
    mapping(address => uint256) private YOpackedAddressData;

    // Mapping from token ID to approved address.
    mapping(uint256 => address) private YOtokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private YOoperatorApprovals;

    constructor(string memory nameYO, string memory symbolYO) {
        YOname = nameYO;
        YOsymbol = symbolYO;
        YOcurrentIndex = YOstartTokenId();
    }

    /**
     * @dev Returns the starting token ID.
     * To change the starting token ID, please override this function.
     */
    function YOstartTokenId() internal view virtual returns (uint256) {
        return 0;
    }

    /**
     * @dev Returns the next token ID to be minted.
     */
    function YOnextTokenId() internal view returns (uint256) {
        return YOcurrentIndex;
    }

    /**
     * @dev Returns the total number of tokens in existence.
     * Burned tokens will reduce the count.
     * To get the total number of tokens minted, please see `YOtotalMinted`.
     */
    function totalSupply() public view override returns (uint256) {
        // Counter underflow is impossible as YOburnCounter cannot be incremented
        // more than `YOcurrentIndex - YOstartTokenId()` times.
        unchecked {
            return YOcurrentIndex - YOburnCounter - YOstartTokenId();
        }
    }

    /**
     * @dev Returns the total amount of tokens minted in the contract.
     */
    function YOtotalMinted() internal view returns (uint256) {
        // Counter underflow is impossible as YOcurrentIndex does not decrement,
        // and it is initialized to `YOstartTokenId()`
        unchecked {
            return YOcurrentIndex - YOstartTokenId();
        }
    }

    /**
     * @dev Returns the total number of tokens burned.
     */
    function YOtotalBurned() internal view returns (uint256) {
        return YOburnCounter;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        // The interface IDs are constants representing the first 4 bytes of the XOR of
        // all function selectors in the interface. See: https://eips.ethereum.org/EIPS/eip-165
        // e.g. `bytes4(i.functionA.selector ^ i.functionB.selector ^ ...)`
        return
            interfaceId == 0x01ffc9a7 || // ERC165 interface ID for ERC165.
            interfaceId == 0x80ac58cd || // ERC165 interface ID for ERC721.
            interfaceId == 0x5b5e139f; // ERC165 interface ID for ERC721Metadata.
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) public view override returns (uint256) {
        if (YOaddressToUint256(owner) == 0) revert BalanceQueryForZeroAddress();
        return YOpackedAddressData[owner] & BITMASKYOADDRESSYODATAYOENTRY;
    }

    /**
     * Returns the number of tokens minted by `owner`.
     */
    function YOnumberMinted(address owner) internal view returns (uint256) {
        return (YOpackedAddressData[owner] >> BITPOSYONUMBERYOMINTED) & BITMASKYOADDRESSYODATAYOENTRY;
    }

    /**
     * Returns the number of tokens burned by or on behalf of `owner`.
     */
    function YOnumberBurned(address owner) internal view returns (uint256) {
        return (YOpackedAddressData[owner] >> BITPOSYONUMBERYOBURNED) & BITMASKYOADDRESSYODATAYOENTRY;
    }

    /**
     * Returns the auxillary data for `owner`. (e.g. number of whitelist mint slots used).
     */
    function YOgetAux(address owner) internal view returns (uint64) {
        return uint64(YOpackedAddressData[owner] >> BITPOSYOAUX);
    }

    /**
     * Sets the auxillary data for `owner`. (e.g. number of whitelist mint slots used).
     * If there are multiple variables, please pack them into a uint64.
     */
    function YOsetAux(address owner, uint64 aux) internal {
        uint256 packed = YOpackedAddressData[owner];
        uint256 auxCasted;
        assembly { // Cast aux without masking.
            auxCasted := aux
        }
        packed = (packed & BITMASKYOAUXYOCOMPLEMENT) | (auxCasted << BITPOSYOAUX);
        YOpackedAddressData[owner] = packed;
    }

    /**
     * Returns the packed ownership data of `tokenId`.
     */
    function YOpackedOwnershipOf(uint256 tokenId) private view returns (uint256) {
        uint256 curr = tokenId;

        unchecked {
            if (YOstartTokenId() <= curr)
                if (curr < YOcurrentIndex) {
                    uint256 packed = YOpackedOwnerships[curr];
                    // If not burned.
                    if (packed & BITMASKYOBURNED == 0) {
                        // Invariant:
                        // There will always be an ownership that has an address and is not burned
                        // before an ownership that does not have an address and is not burned.
                        // Hence, curr will not underflow.
                        //
                        // We can directly compare the packed value.
                        // If the address is zero, packed is zero.
                        while (packed == 0) {
                            packed = YOpackedOwnerships[--curr];
                        }
                        return packed;
                    }
                }
        }
        revert OwnerQueryForNonexistentToken();
    }

    /**
     * Returns the unpacked `TokenOwnership` struct from `packed`.
     */
    function YOunpackedOwnership(uint256 packed) private pure returns (TokenOwnership memory ownership) {
        ownership.addr = address(uint160(packed));
        ownership.startTimestamp = uint64(packed >> BITPOSYOSTARTYOTIMESTAMP);
        ownership.burned = packed & BITMASKYOBURNED != 0;
    }

    /**
     * Returns the unpacked `TokenOwnership` struct at `index`.
     */
    function YOownershipAt(uint256 index) internal view returns (TokenOwnership memory) {
        return YOunpackedOwnership(YOpackedOwnerships[index]);
    }

    /**
     * @dev Initializes the ownership slot minted at `index` for efficiency purposes.
     */
    function YOinitializeOwnershipAt(uint256 index) internal {
        if (YOpackedOwnerships[index] == 0) {
            YOpackedOwnerships[index] = YOpackedOwnershipOf(index);
        }
    }

    /**
     * Gas spent here starts off proportional to the maximum mint batch size.
     * It gradually moves to O(1) as tokens get transferred around in the collection over time.
     */
    function YOownershipOf(uint256 tokenId) internal view returns (TokenOwnership memory) {
        return YOunpackedOwnership(YOpackedOwnershipOf(tokenId));
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view override returns (address) {
        return address(uint160(YOpackedOwnershipOf(tokenId)));
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual override returns (string memory) {
        return YOname;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return YOsymbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!YOexists(tokenId)) revert URIQueryForNonexistentToken();

        string memory baseURI = YObaseURI();
        return bytes(baseURI).length != 0 ? string(abi.encodePacked(baseURI, YOtoString(tokenId))) : '';
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overriden in child contracts.
     */
    function YObaseURI() internal view virtual returns (string memory) {
        return '';
    }

    /**
     * @dev Casts the address to uint256 without masking.
     */
    function YOaddressToUint256(address value) private pure returns (uint256 result) {
        assembly {
            result := value
        }
    }

    /**
     * @dev Casts the boolean to uint256 without branching.
     */
    function YOboolToUint256(bool value) private pure returns (uint256 result) {
        assembly {
            result := value
        }
    }

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public override {
        address owner = address(uint160(YOpackedOwnershipOf(tokenId)));
        if (to == owner) revert ApprovalToCurrentOwner();

        if (YOmsgSenderERC721A() != owner)
            if (!isApprovedForAll(owner, YOmsgSenderERC721A())) {
                revert ApprovalCallerNotOwnerNorApproved();
            }

        YOtokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view override returns (address) {
        if (!YOexists(tokenId)) revert ApprovalQueryForNonexistentToken();

        return YOtokenApprovals[tokenId];
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual override {
        if (operator == YOmsgSenderERC721A()) revert ApproveToCaller();

        YOoperatorApprovals[YOmsgSenderERC721A()][operator] = approved;
        emit ApprovalForAll(YOmsgSenderERC721A(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return YOoperatorApprovals[owner][operator];
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        YOtransfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, '');
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory YOdata
    ) public virtual override {
        YOtransfer(from, to, tokenId);
        if (to.code.length != 0)
            if (!YOcheckContractOnERC721Received(from, to, tokenId, YOdata)) {
                revert TransferToNonERC721ReceiverImplementer();
            }
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`YOmint`),
     */
    function YOexists(uint256 tokenId) internal view returns (bool) {
        return
            YOstartTokenId() <= tokenId &&
            tokenId < YOcurrentIndex && // If within bounds,
            YOpackedOwnerships[tokenId] & BITMASKYOBURNED == 0; // and not burned.
    }

    /**
     * @dev Equivalent to `YOsafeMint(to, quantity, '')`.
     */
    function YOsafeMint(address to, uint256 quantity) internal {
        YOsafeMint(to, quantity, '');
    }

    /**
     * @dev Safely mints `quantity` tokens and transfers them to `to`.
     *
     * Requirements:
     *
     * - If `to` refers to a smart contract, it must implement
     *   {IERC721Receiver-onERC721Received}, which is called for each safe transfer.
     * - `quantity` must be greater than 0.
     *
     * Emits a {Transfer} event.
     */
    function YOsafeMint(
        address to,
        uint256 quantity,
        bytes memory YOdata
    ) internal {
        uint256 startTokenId = YOcurrentIndex;
        if (YOaddressToUint256(to) == 0) revert MintToZeroAddress();
        if (quantity == 0) revert MintZeroQuantity();

        YObeforeTokenTransfers(address(0), to, startTokenId, quantity);

        // Overflows are incredibly unrealistic.
        // balance or numberMinted overflow if current value of either + quantity > 1.8e19 (2**64) - 1
        // updatedIndex overflows if YOcurrentIndex + quantity > 1.2e77 (2**256) - 1
        unchecked {
            // Updates:
            // - `balance += quantity`.
            // - `numberMinted += quantity`.
            //
            // We can directly add to the balance and number minted.
            YOpackedAddressData[to] += quantity * ((1 << BITPOSYONUMBERYOMINTED) | 1);

            // Updates:
            // - `address` to the owner.
            // - `startTimestamp` to the timestamp of minting.
            // - `burned` to `false`.
            // - `nextInitialized` to `quantity == 1`.
            YOpackedOwnerships[startTokenId] =
                YOaddressToUint256(to) |
                (block.timestamp << BITPOSYOSTARTYOTIMESTAMP) |
                (YOboolToUint256(quantity == 1) << BITPOSYONEXTYOINITIALIZED);

            uint256 updatedIndex = startTokenId;
            uint256 end = updatedIndex + quantity;

            if (to.code.length != 0) {
                do {
                    emit Transfer(address(0), to, updatedIndex);
                    if (!YOcheckContractOnERC721Received(address(0), to, updatedIndex++, YOdata)) {
                        revert TransferToNonERC721ReceiverImplementer();
                    }
                } while (updatedIndex < end);
                // Reentrancy protection
                if (YOcurrentIndex != startTokenId) revert();
            } else {
                do {
                    emit Transfer(address(0), to, updatedIndex++);
                } while (updatedIndex < end);
            }
            YOcurrentIndex = updatedIndex;
        }
        YOafterTokenTransfers(address(0), to, startTokenId, quantity);
    }

    /**
     * @dev Mints `quantity` tokens and transfers them to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `quantity` must be greater than 0.
     *
     * Emits a {Transfer} event.
     */
    function YOmint(address to, uint256 quantity) internal {
        uint256 startTokenId = YOcurrentIndex;
        if (YOaddressToUint256(to) == 0) revert MintToZeroAddress();
        if (quantity == 0) revert MintZeroQuantity();

        YObeforeTokenTransfers(address(0), to, startTokenId, quantity);

        // Overflows are incredibly unrealistic.
        // balance or numberMinted overflow if current value of either + quantity > 1.8e19 (2**64) - 1
        // updatedIndex overflows if YOcurrentIndex + quantity > 1.2e77 (2**256) - 1
        unchecked {
            // Updates:
            // - `balance += quantity`.
            // - `numberMinted += quantity`.
            //
            // We can directly add to the balance and number minted.
            YOpackedAddressData[to] += quantity * ((1 << BITPOSYONUMBERYOMINTED) | 1);

            // Updates:
            // - `address` to the owner.
            // - `startTimestamp` to the timestamp of minting.
            // - `burned` to `false`.
            // - `nextInitialized` to `quantity == 1`.
            YOpackedOwnerships[startTokenId] =
                YOaddressToUint256(to) |
                (block.timestamp << BITPOSYOSTARTYOTIMESTAMP) |
                (YOboolToUint256(quantity == 1) << BITPOSYONEXTYOINITIALIZED);

            uint256 updatedIndex = startTokenId;
            uint256 end = updatedIndex + quantity;

            do {
                emit Transfer(address(0), to, updatedIndex++);
            } while (updatedIndex < end);

            YOcurrentIndex = updatedIndex;
        }
        YOafterTokenTransfers(address(0), to, startTokenId, quantity);
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function YOtransfer(
        address from,
        address to,
        uint256 tokenId
    ) private {
        uint256 prevOwnershipPacked = YOpackedOwnershipOf(tokenId);

        if (address(uint160(prevOwnershipPacked)) != from) revert TransferFromIncorrectOwner();

        address approvedAddress = YOtokenApprovals[tokenId];

        bool isApprovedOrOwner = (YOmsgSenderERC721A() == from ||
            isApprovedForAll(from, YOmsgSenderERC721A()) ||
            approvedAddress == YOmsgSenderERC721A());

        if (!isApprovedOrOwner) revert TransferCallerNotOwnerNorApproved();
        if (YOaddressToUint256(to) == 0) revert TransferToZeroAddress();

        YObeforeTokenTransfers(from, to, tokenId, 1);

        // Clear approvals from the previous owner.
        if (YOaddressToUint256(approvedAddress) != 0) {
            delete YOtokenApprovals[tokenId];
        }

        // Underflow of the sender's balance is impossible because we check for
        // ownership above and the recipient's balance can't realistically overflow.
        // Counter overflow is incredibly unrealistic as tokenId would have to be 2**256.
        unchecked {
            // We can directly increment and decrement the balances.
            --YOpackedAddressData[from]; // Updates: `balance -= 1`.
            ++YOpackedAddressData[to]; // Updates: `balance += 1`.

            // Updates:
            // - `address` to the next owner.
            // - `startTimestamp` to the timestamp of transfering.
            // - `burned` to `false`.
            // - `nextInitialized` to `true`.
            YOpackedOwnerships[tokenId] =
                YOaddressToUint256(to) |
                (block.timestamp << BITPOSYOSTARTYOTIMESTAMP) |
                BITMASKYONEXTYOINITIALIZED;

            // If the next slot may not have been initialized (i.e. `nextInitialized == false`) .
            if (prevOwnershipPacked & BITMASKYONEXTYOINITIALIZED == 0) {
                uint256 nextTokenId = tokenId + 1;
                // If the next slot's address is zero and not burned (i.e. packed value is zero).
                if (YOpackedOwnerships[nextTokenId] == 0) {
                    // If the next slot is within bounds.
                    if (nextTokenId != YOcurrentIndex) {
                        // Initialize the next slot to maintain correctness for `ownerOf(tokenId + 1)`.
                        YOpackedOwnerships[nextTokenId] = prevOwnershipPacked;
                    }
                }
            }
        }

        emit Transfer(from, to, tokenId);
        YOafterTokenTransfers(from, to, tokenId, 1);
    }

    /**
     * @dev Equivalent to `YOburn(tokenId, false)`.
     */
    function YOburn(uint256 tokenId) internal virtual {
        YOburn(tokenId, false);
    }

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function YOburn(uint256 tokenId, bool approvalCheck) internal virtual {
        uint256 prevOwnershipPacked = YOpackedOwnershipOf(tokenId);

        address from = address(uint160(prevOwnershipPacked));
        address approvedAddress = YOtokenApprovals[tokenId];

        if (approvalCheck) {
            bool isApprovedOrOwner = (YOmsgSenderERC721A() == from ||
                isApprovedForAll(from, YOmsgSenderERC721A()) ||
                approvedAddress == YOmsgSenderERC721A());

            if (!isApprovedOrOwner) revert TransferCallerNotOwnerNorApproved();
        }

        YObeforeTokenTransfers(from, address(0), tokenId, 1);

        // Clear approvals from the previous owner.
        if (YOaddressToUint256(approvedAddress) != 0) {
            delete YOtokenApprovals[tokenId];
        }

        // Underflow of the sender's balance is impossible because we check for
        // ownership above and the recipient's balance can't realistically overflow.
        // Counter overflow is incredibly unrealistic as tokenId would have to be 2**256.
        unchecked {
            // Updates:
            // - `balance -= 1`.
            // - `numberBurned += 1`.
            //
            // We can directly decrement the balance, and increment the number burned.
            // This is equivalent to `packed -= 1; packed += 1 << BITPOSYONUMBERYOBURNED;`.
            YOpackedAddressData[from] += (1 << BITPOSYONUMBERYOBURNED) - 1;

            // Updates:
            // - `address` to the last owner.
            // - `startTimestamp` to the timestamp of burning.
            // - `burned` to `true`.
            // - `nextInitialized` to `true`.
            YOpackedOwnerships[tokenId] =
                YOaddressToUint256(from) |
                (block.timestamp << BITPOSYOSTARTYOTIMESTAMP) |
                BITMASKYOBURNED |
                BITMASKYONEXTYOINITIALIZED;

            // If the next slot may not have been initialized (i.e. `nextInitialized == false`) .
            if (prevOwnershipPacked & BITMASKYONEXTYOINITIALIZED == 0) {
                uint256 nextTokenId = tokenId + 1;
                // If the next slot's address is zero and not burned (i.e. packed value is zero).
                if (YOpackedOwnerships[nextTokenId] == 0) {
                    // If the next slot is within bounds.
                    if (nextTokenId != YOcurrentIndex) {
                        // Initialize the next slot to maintain correctness for `ownerOf(tokenId + 1)`.
                        YOpackedOwnerships[nextTokenId] = prevOwnershipPacked;
                    }
                }
            }
        }

        emit Transfer(from, address(0), tokenId);
        YOafterTokenTransfers(from, address(0), tokenId, 1);

        // Overflow not possible, as YOburnCounter cannot be exceed YOcurrentIndex times.
        unchecked {
            YOburnCounter++;
        }
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param YOdata bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function YOcheckContractOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory YOdata
    ) private returns (bool) {
        try ERC721AYOYOIERC721Receiver(to).onERC721Received(YOmsgSenderERC721A(), from, tokenId, YOdata) returns (
            bytes4 retval
        ) {
            return retval == ERC721AYOYOIERC721Receiver(to).onERC721Received.selector;
        } catch (bytes memory reason) {
            if (reason.length == 0) {
                revert TransferToNonERC721ReceiverImplementer();
            } else {
                assembly {
                    revert(add(32, reason), mload(reason))
                }
            }
        }
    }

    /**
     * @dev Hook that is called before a set of serially-ordered token ids are about to be transferred. This includes minting.
     * And also called before burning one token.
     *
     * startTokenId - the first token id to be transferred
     * quantity - the amount to be transferred
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, `from`'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, `tokenId` will be burned by `from`.
     * - `from` and `to` are never both zero.
     */
    function YObeforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual {}

    /**
     * @dev Hook that is called after a set of serially-ordered token ids have been transferred. This includes
     * minting.
     * And also called after one token has been burned.
     *
     * startTokenId - the first token id to be transferred
     * quantity - the amount to be transferred
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, `from`'s `tokenId` has been
     * transferred to `to`.
     * - When `from` is zero, `tokenId` has been minted for `to`.
     * - When `to` is zero, `tokenId` has been burned by `from`.
     * - `from` and `to` are never both zero.
     */
    function YOafterTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual {}

    /**
     * @dev Returns the message sender (defaults to `msg.sender`).
     *
     * If you are writing GSN compatible contracts, you need to override this function.
     */
    function YOmsgSenderERC721A() internal view virtual returns (address) {
        return msg.sender;
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function YOtoString(uint256 value) internal pure returns (string memory ptr) {
        assembly {
            // The maximum value of a uint256 contains 78 digits (1 byte per digit),
            // but we allocate 128 bytes to keep the free memory pointer 32-byte word aliged.
            // We will need 1 32-byte word to store the length,
            // and 3 32-byte words to store a maximum of 78 digits. Total: 32 + 3 * 32 = 128.
            ptr := add(mload(0x40), 128)
            // Update the free memory pointer to allocate.
            mstore(0x40, ptr)

            // Cache the end of the memory to calculate the length later.
            let end := ptr

            // We write the string from the rightmost digit to the leftmost digit.
            // The following is essentially a do-while loop that also handles the zero case.
            // Costs a bit more than early returning for the zero case,
            // but cheaper in terms of deployment and overall runtime costs.
            for {
                // Initialize and perform the first pass without check.
                let temp := value
                // Move the pointer 1 byte leftwards to point to an empty character slot.
                ptr := sub(ptr, 1)
                // Write the character to the pointer. 48 is the ASCII index of '0'.
                mstore8(ptr, add(48, mod(temp, 10)))
                temp := div(temp, 10)
            } temp {
                // Keep dividing `temp` until zero.
                temp := div(temp, 10)
            } { // Body of the for loop.
                ptr := sub(ptr, 1)
                mstore8(ptr, add(48, mod(temp, 10)))
            }

            let length := sub(end, ptr)
            // Move the pointer 32 bytes leftwards to make room for the length.
            ptr := sub(ptr, 32)
            // Store the length.
            mstore(ptr, length)
        }
    }
}
