// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract ModifierDefinitions {
  // We enforce the use of parentheses in modifiers without parameters.
  modifier emptyParams {_;}
  modifier noParams() {_;}
}

contract ModifierInvocations is ModifierDefinitions {
  // We can't differentiate between constructor calls or modifiers, so we keep
  // parentheses untouched in constructors.
  constructor () emptyParams noParams() ModifierDefinitions() {}

  // We remove parentheses in modifiers without arguments.
  function test() public emptyParams noParams() {}
}
