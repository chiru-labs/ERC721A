pragma solidity ^0.5.2;

contract AddressPayable {
  using Address for address payable;
  address payable[] hello;
  function sendSomeEth(address payable to, address payable[] memory world) public payable {
    address payable target = to;
    target.transfer(msg.value);
  }
}
