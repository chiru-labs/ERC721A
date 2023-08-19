// This comment spans one line

/*
This
comment
spans
multiple
lines.
*/

pragma   solidity   ^0.4.23;
contract Inbox {
  string public message;

  constructor(string initialMessage) public {
    message = initialMessage;
  }

  function setMessage(string newMessage) public {
    message = newMessage;
  }

  function nothingHere() public {
    // to be defined
  }

  function nothingHereMultipleComments() public {
    // to be defined
    // to be defined 2
    /* to be defined 3 */
  }
}

