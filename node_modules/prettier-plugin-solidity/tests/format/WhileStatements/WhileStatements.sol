contract WhileStatements {
    uint constant LONG_VARIABLE = 1;

    function whileStatements() public {
        uint a;
        uint veryLongVariableName;

        while (a < 100) a++;

        while (a < 200) a = a.add(LONG_VARIABLE).add(LONG_VARIABLE).add(LONG_VARIABLE);

        while (a < 300) { a++; }

        while (a < 400) { a = a.add(LONG_VARIABLE).add(LONG_VARIABLE).add(LONG_VARIABLE); }

        while (a < veryLongVariableName.add(LONG_VARIABLE).add(LONG_VARIABLE) * 500) a++;

        while (a < veryLongVariableName.add(LONG_VARIABLE).add(LONG_VARIABLE) * 600) { a++; }
    }

    function doWhileStatements() public {
        uint a;
        uint veryLongVariableName;

        do a++; while (a < 100);

        do  a = a.add(LONG_VARIABLE).add(LONG_VARIABLE).add(LONG_VARIABLE); while (a < 200);

        do  { a++; }while (a < 300);

        do  { a = a.add(LONG_VARIABLE).add(LONG_VARIABLE).add(LONG_VARIABLE); }while (a < 400);

        do  a++;while (a < veryLongVariableName.add(LONG_VARIABLE).add(LONG_VARIABLE) * 500);

        do  { a++; }while (a < veryLongVariableName.add(LONG_VARIABLE).add(LONG_VARIABLE) * 600);
    }
}
