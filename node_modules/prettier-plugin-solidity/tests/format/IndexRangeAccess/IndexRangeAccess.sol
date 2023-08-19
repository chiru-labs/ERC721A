pragma solidity ^0.6.4;

contract Demo {
    event Log(bytes value);

    function log(bytes calldata value) external {
        emit Log(bytes(value[0:10]));
    }
}
