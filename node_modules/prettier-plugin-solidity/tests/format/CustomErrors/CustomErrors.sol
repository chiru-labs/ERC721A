pragma solidity ^0.8.4;

error
  TopLevelCustomError();
  error TopLevelCustomErrorWithArg(uint    x)  ;
error TopLevelCustomErrorArgWithoutName  (string);

contract CustomErrors {
  error
    ContractCustomError();
    error ContractCustomErrorWithArg(uint    x)  ;
  error ContractCustomErrorArgWithoutName  (string);

  function throwCustomError() {
    revert
      FunctionCustomError();
    revert FunctionCustomErrorWithArg(  1  )  ;
    revert    FunctionCustomErrorArgWithoutName  (  "a reason");
  }
}
