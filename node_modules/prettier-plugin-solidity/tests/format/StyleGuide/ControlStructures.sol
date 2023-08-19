pragma solidity >=0.4.0 <0.7.0;


contract ControlStructures
{
    struct Bank
    {
        address owner;
        uint balance;
    }

    function () {
        if (true)
        {
            doSomething();
        }

        while(true){
            break;
        }

        for (uint a; a < 10; a++) {
            doSomethingElse();}

        /* TODO: singleline trueBody should be printed and indented in a new
                 line
        if (x < 10)
            x += 1;
        */

        /* TODO: force braquets if statement is too complex
        if (x < 10)
            someArray.push(Coin({
                name: 'spam',
                value: 42
            }));
        */

        if (x < 3) {
            x += 1;
        } else
        if (x > 7) {
            x -= 1;
        }
        else {
            x = 5;
        }

        /* TODO: singleline trueBody and falseBody should be printed and
                 indented in a new line
        if (x < 3)
            x += 1;
        else
            x -= 1;
        */
    }
}
