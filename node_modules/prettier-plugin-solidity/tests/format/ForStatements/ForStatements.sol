contract ForStatements {
    uint constant LONG_VARIABLE = 1;

    function hi() public {
        uint a;

        for (uint i; i < 100; i++) a++;

        for (i = 0; i < 100; i++) a = a.add(LONG_VARIABLE).add(LONG_VARIABLE).add(LONG_VARIABLE);

        for (i = 0; i < 100; i++) { a++; }

        for (i = 0; i < 100; i++) { a = a.add(LONG_VARIABLE).add(LONG_VARIABLE).add(LONG_VARIABLE); }

        for (uint veryLongVariableName; veryLongVariableName < 100; veryLongVariableName++) a++;

        for (veryLongVariableName = 0; veryLongVariableName < 100; veryLongVariableName++) { a++; }

        for (; ; ) { // #178
        }

        for (i = 0; ;) {
        }

        for (i = 0; i < 100; ) {
        }

        for (i = 0; ; i++) {
        }

        for (i = 0; i < 100; i++) {
        }

        for (; i < 100; i++) {
        }

        for (; i < 100; ) {
        }

        for (; ; i++) {
        }
    }
}
