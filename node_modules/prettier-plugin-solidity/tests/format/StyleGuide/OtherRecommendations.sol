pragma solidity >=0.4.0 <0.7.0;


contract OtherRecommendations {
    function () {
        str = 'bar';
        /* TODO: escape quotes in Strings when enforcing a new quote
        str = '"Be yourself; everyone else is already taken." -Oscar Wilde';
        */

        x=3;
        x = 100/10;
        x += 3+4;
        x |= y&&z;


        /* TODO: whitespace around and operator can be different than 1 space if
                 it is the same length before and after
        x = 2**3 + 5;
        x = 2*y + 3*z;
        x = (a+b) * (a-b);
        */


        x = 2** 3 + 5;
        x = y+z;
        x +=1;
    }
}
