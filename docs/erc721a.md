# ERC721A

[`erc721a/contracts/ERC721A.sol`](https://github.com/chiru-labs/ERC721A/blob/main/contracts/ERC721A.sol)

Implementation of [ERC721](https://eips.ethereum.org/EIPS/eip-721) Non-Fungible Token Standard, including the Metadata extension. Built to optimize for lower gas during batch mints.

Token IDs are minted sequentially (e.g. 0, 1, 2, 3...) starting from `_startTokenId()`.

An owner cannot have more than `2**64 - 1` (max value of `uint64`) tokens.

Inherits:

- [Context](https://docs.openzeppelin.com/contracts/2.x/api/gsn)
- [IERC721](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#IERC721) 
- [IERC721Metadata](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#IERC721Metadata) 
- [IERC165](https://docs.openzeppelin.com/contracts/4.x/api/utils#IERC165)

## Structs

### TokenOwnership 

```solidity
struct TokenOwnership {
    // The address of the owner.
    address addr;
    // Keeps track of the start time of ownership with minimal overhead for tokenomics.
    uint64 startTimestamp;
    // Whether the token has been burned.
    bool burned;
}
```

Holds ownership data for each token.

`startTimestamp` is the timestamp when the token is minted to, transferred to, or burned by `addr`.

The compiler will pack this into a single 256 bit word in storage.

### AddressData 

```solidity
 struct AddressData {
    // The token balance of the address. 2**64 - 1 is more than enough.
    uint64 balance;
    // Keeps track of mint count with minimal overhead for tokenomics.
    uint64 numberMinted;
    // Keeps track of burn count with minimal overhead for tokenomics.
    uint64 numberBurned;
    // For miscellaneous variable(s) pertaining to the address
    // (e.g. number of whitelist mint slots used).
    // If there are multiple variables, please pack them into a uint64.
    uint64 aux;
}
```

Holds balance and other data for each address.

The compiler will pack this into a single 256 bit word in storage.

## Variables

### \_currentIndex

```solidity
uint256 internal _currentIndex
```

The next token ID to be minted.

To get the total number of tokens in existence, please see [`totalSupply`](#totalSupply).

To get the total number of tokens minted, please see [`_totalMinted`](#_totalMinted).

### \_burnCounter

```solidity
uint256 internal _burnCounter
```

The number of tokens burned.

### \_ownerships

```solidity
mapping(uint256 => TokenOwnership) internal _ownerships
```

Mapping from token ID to ownership details.

An empty struct value does not necessarily mean the token is unowned. 

See [`_ownershipOf`](#_ownershipOf).



## Functions

### constructor

```solidity
constructor(string memory name_, string memory symbol_)
```

Initializes the contract by setting a `name` and a `symbol` to the token collection.

### supportsInterface 

`IERC165-supportsInterface`

```solidity
function supportsInterface(
    bytes4 interfaceId
) public view virtual override(ERC165, IERC165) returns (bool)
```

Returns `true` if this contract implements the interface defined by `interfaceId`. 

See the corresponding [EIP section](https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified) to learn more about how these ids are created.

### totalSupply

`IERC721Enumerable-totalSupply`

```solidity
function totalSupply() public view returns (uint256)
```

Returns the total number of tokens in existence. 

Burned tokens will reduce the count.

To get the total number of tokens minted, please see [`_totalMinted`](#_totalMinted).

### balanceOf

`IERC721-balanceOf`

```solidity
function balanceOf(address owner) public view override returns (uint256)
```

Returns the number of tokens in `owner`'s account.

### ownerOf

`IERC721-ownerOf`

```solidity
function ownerOf(uint256 tokenId) public view override returns (address)
```

Returns the owner of the `tokenId` token.

Requirements:

- `tokenId` must exist.

### name

`IERC721Metadata-name`

```solidity
function name() public view virtual override returns (string memory)
```

Returns the token collection name.

### symbol

`IERC721Metadata-symbol`

```solidity
function symbol() public view virtual override returns (string memory)
```

Returns the token collection symbol.

### tokenURI

`IERC721Metadata-tokenURI`

```solidity
function tokenURI(uint256 tokenId) public view virtual override returns (string memory)
```

Returns the Uniform Resource Identifier (URI) for `tokenId` token.

### \_baseURI

```solidity
function _baseURI() internal view virtual returns (string memory)
```

Base URI for computing `tokenURI`.

If set, the resulting URI for each token will be the concatenation of the `baseURI` and the `tokenId`.

Empty by default, can be overriden in child contracts.

### approve

`IERC721-approve`

```solidity
function approve(address to, uint256 tokenId) public override
```

Gives permission to `to` to transfer `tokenId` token to another account. The approval is cleared when the token is transferred.

Only a single account can be approved at a time, so approving the zero address clears previous approvals.

Requirements:

- The caller must own the token or be an approved operator.
- `tokenId` must exist.

Emits an `Approval` event.

### getApproved

```solidity
function getApproved(uint256 tokenId) public view override returns (address)
```

`IERC721-getApproved`

Returns the account approved for `tokenId` token.

Requirements:

- tokenId must exist.

### setApprovalForAll

`IERC721-setApprovalForAll`

```solidity
function setApprovalForAll(
    address operator, 
    bool approved
) public virtual override
```

Approve or remove `operator` as an operator for the caller. Operators can call `transferFrom` or `safeTransferFrom` for any token owned by the caller.

Requirements:

- The `operator` cannot be the caller.

Emits an `ApprovalForAll` event.

### isApprovedForAll

`IERC721-isApprovedForAll`

```solidity
function isApprovedForAll(
    address owner, 
    address operator
) public view virtual override returns (bool)
```

Returns if the `operator` is allowed to manage all of the assets of owner.

See [`setApprovalForAll`](#setApprovalForAll).

### transferFrom

`IERC721-transferFrom`

```solidity
function transferFrom(
    address from, 
    address to, 
    uint256 tokenId
) public virtual override
```

Transfers `tokenId` token from `from` to `to`.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must be owned by `from`.
- If the caller is not `from`, it must be approved to move this token by either `approve` or `setApprovalForAll`.

Emits a `Transfer` event.

### safeTransferFrom

`IERC721-safeTransferFrom`

```solidity
function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
) public virtual override
```

Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients are aware of the ERC721 protocol to prevent tokens from being forever locked.

The `data` parameter is forwarded in `IERC721Receiver.onERC721Received` to contract recipients (optional, default: `""`).

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must be owned by `from`.
- If the caller is not `from`, it must be approved to move this token by either `approve` or `setApprovalForAll`.
- If `to` refers to a smart contract, it must implement `IERC721Receiver.onERC721Received`, which is called upon a safe transfer.

Emits a `Transfer` event.


### \_startTokenId

```solidity
function _startTokenId() internal view virtual returns (uint256)
```

Returns the starting token ID (default: `0`). 

To change the starting token ID, override this function to return a different constant. 


### \_totalMinted

```solidity
function _totalMinted() internal view returns (uint256)
```

Returns the total amount of tokens minted.

### \_numberMinted

```solidity
function _numberMinted(address owner) internal view returns (uint256)
```

Returns the number of tokens minted by or on behalf of `owner`.

### \_numberBurned

```solidity
function _numberBurned(address owner) internal view returns (uint256)
```

Returns the number of tokens burned by or on behalf of `owner`.

### \_getAux

```solidity
function _getAux(address owner) internal view returns (uint64)
```

Returns the auxillary data for `owner` (e.g. number of whitelist mint slots used).

### \_setAux

```solidity
function _setAux(address owner, uint64 aux) internal
```

Sets the auxillary data for `owner` (e.g. number of whitelist mint slots used).

If there are multiple variables, please pack them into a `uint64`.


### \_ownershipOf

```solidity
function _ownershipOf(uint256 tokenId) internal view returns (TokenOwnership memory)
```

Returns the token ownership data for `tokenId`. See [`TokenOwnership`](#TokenOwnership).

The gas spent here starts off proportional to the maximum mint batch size.

It gradually moves to O(1) as tokens get transferred around in the collection over time. 

### \_exists

```solidity
function _exists(uint256 tokenId) internal view returns (bool)
```

Returns whether `tokenId` exists.

Tokens can be managed by their owner or approved accounts via `approve` or `setApprovalForAll`.

Tokens start existing when they are minted via `_mint`.

### \_safeMint

```solidity
function _safeMint(
    address to,
    uint256 quantity,
    bytes memory _data
) internal
```

Equivalent to `_mint(to, quantity, data, true)`. 

The `data` parameter is forwarded in `IERC721Receiver.onERC721Received` to contract recipients (optional, default: `""`).

See [`_mint`](#_mint).

### \_mint

```solidity
function _mint(
    address to,
    uint256 quantity,
    bytes memory _data,
    bool safe
) internal
```

Mints `quantity` tokens and transfers them to `to`.

The `data` parameter is forwarded in `IERC721Receiver.onERC721Received` to contract recipients.  

If `safe` is set to `true`, contract recipients are checked to be aware of the ERC721 protocol to prevent tokens from being forever locked (set to `""` if unused).

**Safe minting is reentrant safe and doubles as an gas-optimized reentrancy guard since V3.**

> To prevent excessive first-time token transfer costs, please limit the `quantity` to a reasonable number (e.g. `30`). 

Requirements:

- `to` cannot be the zero address.
- `quantity` must be greater than `0`.

Emits a `Transfer` event.


### \_burn

```solidity
function _burn(uint256 tokenId, bool approvalCheck) internal virtual
```

Destroys `tokenId`.

The approval is cleared when the token is burned.

Requirements:

- `tokenId` must exist.
- If `approvalCheck` is `true`, the caller must own `tokenId` or be an approved operator.

Emits a `Transfer` event.

## Events

### Transfer

`IERC721-Transfer`

```solidity
event Transfer(address from, address to, uint256 tokenId)
```

Emitted when `tokenId` token is transferred from `from` to `to`.

### Approval

`IERC721-Approval`

```solidity
event Approval(address owner, address approved, uint256 tokenId)
```

Emitted when `owner` enables `approved` to manage the `tokenId` token.

### ApprovalForAll

`IERC721-ApprovalForAll`

```solidity
event ApprovalForAll(address owner, address operator, bool approved)
```

Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
