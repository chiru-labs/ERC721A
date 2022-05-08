// SPDX-License-Identifier: MIT
// Creator: LikKee

pragma solidity ^0.8.4;

import '../ERC721A.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

error NotOwner();
error NotALock();
error TokenLocked();
error InvalidParam();
error LockAdded(address);
error HaveLocks();
error TokenNotExist();
error NotLocked();
error SelfNotAllow();

abstract contract ERC721ALockable is ERC721A {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => EnumerableSet.AddressSet) private locksAdded;
    mapping(address => mapping(address => EnumerableSet.UintSet)) private tokenIdsOfLock;
    mapping(address => EnumerableSet.UintSet) private tokenIdsOfOwner;
    mapping(uint256 => EnumerableSet.AddressSet) private locksOfTokenId;
    uint256 public totalLockTokens;

    modifier onlyTokenOwner() {
        if (balanceOf(msg.sender) == 0) revert NotOwner();
        _;
    }

    modifier onlyLock(address _owner) {
        if (!locksAdded[_owner].contains(msg.sender)) revert NotALock();
        _;
    }

    event AddLock(address indexed owner, address lock);
    event RemoveLock(address indexed lock, address owner);
    event LockToken(uint256 indexed tokenId, address lock);
    event UnlockToken(uint256 indexed tokenId, address lock);
    event UnlockAndTransferToken(address lock, address to, uint256 indexed tokenId);

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);
        if (!isUnlocked(startTokenId)) revert TokenLocked();
    }

    function isUnlocked(uint256 _tokenId) public view returns (bool) {
        return locksOfTokenId[_tokenId].length() == 0;
    }

    function getOwnerTokens(address _owner) external view returns (uint256[] memory) {
        return tokenIdsOfOwner[_owner].values();
    }

    function getOwnerLocks(address _owner) external view returns (address[] memory) {
        return locksAdded[_owner].values();
    }

    function getTokenLocks(uint256 _tokenId) external view returns (address[] memory) {
        return locksOfTokenId[_tokenId].values();
    }

    function getLockTokens(address lock, address _owner) external view returns (uint256[] memory) {
        return tokenIdsOfLock[_owner][lock].values();
    }

    function addLocks(address[] calldata _addresses) public {
        if (_addresses.length == 0) revert InvalidParam();
        for (uint256 i; i < _addresses.length; i++) {
            _add(_addresses[i]);
        }
    }

    function addLocksAndApproveThis(address[] calldata _addresses) external {
        addLocks(_addresses);
        setApprovalForAll(address(this), true);
    }

    function remove(address _owner) external {
        _remove(_owner);
    }

    function lockId(address _owner, uint256 _tokenId) external {
        _lock(_owner, _tokenId);
    }

    function lockIds(address _owner, uint256[] calldata _tokenIds) external {
        if (_tokenIds.length == 0) revert InvalidParam();
        for (uint256 i; i < _tokenIds.length; i++) {
            _lock(_owner, _tokenIds[i]);
        }
    }

    function unlockId(address _owner, uint256 _tokenId) external {
        _unlock(_owner, _tokenId);
    }

    function unlockAll(address _owner) public {
        uint256[] memory _tokenIds = tokenIdsOfLock[_owner][msg.sender].values();
        if (_tokenIds.length == 0) revert NotLocked();
        for (uint256 i; i < _tokenIds.length; i++) {
            _unlock(_owner, _tokenIds[i]);
        }
    }

    function unlockAllAndRemove(address _owner) external {
        unlockAll(_owner);
        _remove(_owner);
    }

    function unlockAndTransferId(
        address _owner,
        address _to,
        uint256 _tokenId
    ) public {
        _unlock(_owner, _tokenId);
        if (!isUnlocked(_tokenId)) revert HaveLocks();
        IERC721(address(this)).safeTransferFrom(_owner, _to, _tokenId, '');

        emit UnlockAndTransferToken(msg.sender, _to, _tokenId);
    }

    function unlockAndTransferAll(address _owner, address _to) external {
        uint256[] memory _tokenIds = tokenIdsOfLock[_owner][msg.sender].values();
        for (uint256 i; i < _tokenIds.length; i++) {
            unlockAndTransferId(_owner, _to, _tokenIds[i]);
        }
    }

    function _add(address _address) internal onlyTokenOwner {
        if (_address == msg.sender) revert SelfNotAllow();
        if (locksAdded[msg.sender].contains(_address)) revert LockAdded(_address);
        locksAdded[msg.sender].add(_address);

        emit AddLock(msg.sender, _address);
    }

    function _remove(address _owner) internal onlyLock(_owner) {
        if (tokenIdsOfLock[_owner][msg.sender].length() > 0) revert HaveLocks();
        locksAdded[_owner].remove(msg.sender);

        emit RemoveLock(msg.sender, _owner);
    }

    function _lock(address _owner, uint256 _tokenId) internal onlyLock(_owner) {
        if (ownerOf(_tokenId) != _owner) revert NotOwner();
        if (locksOfTokenId[_tokenId].contains(msg.sender)) revert TokenLocked();

        if (isUnlocked(_tokenId)) {
            totalLockTokens++;
        }
        locksOfTokenId[_tokenId].add(msg.sender);
        tokenIdsOfLock[_owner][msg.sender].add(_tokenId);
        if (!tokenIdsOfOwner[_owner].contains(_tokenId)) {
            tokenIdsOfOwner[_owner].add(_tokenId);
        }

        emit LockToken(_tokenId, msg.sender);
    }

    function _unlock(address _owner, uint256 _tokenId) internal onlyLock(_owner) {
        if (!_exists(_tokenId)) revert TokenNotExist();
        if (!locksOfTokenId[_tokenId].contains(msg.sender)) revert NotLocked();

        locksOfTokenId[_tokenId].remove(msg.sender);
        tokenIdsOfLock[_owner][msg.sender].remove(_tokenId);
        if (isUnlocked(_tokenId)) {
            tokenIdsOfOwner[_owner].remove(_tokenId);
            totalLockTokens--;
        }

        emit UnlockToken(_tokenId, msg.sender);
    }
}
