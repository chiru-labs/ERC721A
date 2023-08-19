pragma solidity >=0.4.0 <0.7.0;


contract FunctionCalls {
    function() {
        thisFunctionCallIsReallyLong(longArgument1,
                                     longArgument2,
                                     longArgument3
        );

        thisFunctionCallIsReallyLong(longArgument1,
            longArgument2,
            longArgument3
        );

        thisFunctionCallIsReallyLong(
            longArgument1, longArgument2,
            longArgument3
        );

        thisFunctionCallIsReallyLong(
        longArgument1,
        longArgument2,
        longArgument3
        );

        thisFunctionCallIsReallyLong(
            longArgument1,
            longArgument2,
            longArgument3);
    }
}


contract AssignmentStatements {
    function() {
        thisIsALongNestedMapping[being][set][to_some_value] = someFunction(argument1,
                                                                           argument2,
                                                                           argument3,
                                                                           argument4);
    }
}


contract EventDefinitionsAndEventEmitters {
    event LongAndLotsOfArgs(address sender,
                            address recipient,
                            uint256 publicKey,
                            uint256 amount,
                            bytes32[] options,
                            bytes32 longAttribute);

    function() {
        LongAndLotsOfArgs(sender,
                          recipient,
                          publicKey,
                          amount,
                          options,
                          longAttribute);
        emit LongAndLotsOfArgs(sender,
                               recipient,
                               publicKey,
                               amount,
                               options,
                               longAttribute);
    }
}
