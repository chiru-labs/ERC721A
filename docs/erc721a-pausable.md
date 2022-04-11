# ERC721APausable

[`erc721a/contracts/extensions/ERC721APausable.sol`](https://github.com/chiru-labs/ERC721A/blob/main/contracts/extensions/ERC721APausable.sol)

ERC721A token with pausable token transfers, minting and burning.

Inherits:

- [ERC721A](erc721a.md)
- [Pauseable](https://docs.openzeppelin.com/contracts/4.x/api/security#Pausable)

## Modifiers

### whenNotPaused

```solidity
modifier whenNotPaused()
```

Modifier to make a function callable only when the contract is not paused.

Requirements:

- The contract must not be paused.

### whenPaused

```solidity
modifier whenPaused()
```

Modifier to make a function callable only when the contract is paused.

Requirements:

- The contract must be paused.

## Functions

### paused

```solidity
function paused() public view virtual returns (bool)
```

Returns `true` if the contract is paused, and `false` otherwise.

### _pause

```solidity
function _pause() internal virtual whenNotPaused
```

Triggers stopped state.

Requirements:

- The contract must not be paused.

### _unpause

```solidity
function _unpause() internal virtual whenPaused
```

Returns to normal state.

Requirements:

- The contract must be paused.

## Events

### Paused

```solidity
event Paused(address account)
```

Emitted when the pause is triggered by `account`.

### Unpaused

```solidity
event Unpaused(address account)
```

Emitted when the pause is lifted by `account`.
