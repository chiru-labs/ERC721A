# ERC721AOwnersExplicit

[`erc721a/contracts/extensions/ERC721AOwnersExplicit.sol`](https://github.com/chiru-labs/ERC721A/blob/main/contracts/extensions/ERC721AOwnersExplicit.sol)

ERC721A Token class for manually initializing ownership slots.

Inherits:

- [ERC721A](erc721a.md)

## Functions

### _setOwnersExplicit

```solidity
function _setOwnersExplicit(uint256 quantity) internal
```

Explicitly initializes slots in the `_ownerships` mapping to eliminate loops 
in future calls of `_ownershipOf()`.

`quantity` denotes how many slots to initialize in a single call. 