pragma solidity ^0.4.24;


contract Conditional {
    function foo() {
        address contextAddress = longAddress_ == address(0) ? msg.sender : currentContextAddress_;
        asset == ETH
        ? require(address(uint160(msg.sender)).send(quantity), "failed to transfer ether") // explicit casting to `address payable`
        : transferTokensToAccountSecurely(Token(asset), quantity, msg.sender);
        asset == ETH
        ? true
        : transferTokensToAccountSecurely(Token(asset), quantity, msg.sender);
        asset == ETH
        ? require(address(uint160(msg.sender)).send(quantity), "failed to transfer ether")
        : false;
    }

    // TODO: work with a break in the condition level.
    // function foo() {
    //     address contextAddress = veryVeryVeryVeryVeryVeryVeryVeryVeryLongAddress_ == address(0) ? msg.sender : currentContextAddress_;
    // }

    function bar() {
        uint a = true ? 0 : 1;
    }
}
