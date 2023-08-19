pragma solidity 0.6.12;

contract Bug {
  // This is a comment
  uint public hello;

  // Another comment
  uint public bigNum = 100_000;

  // This will disappear
  uint public magic;
}
