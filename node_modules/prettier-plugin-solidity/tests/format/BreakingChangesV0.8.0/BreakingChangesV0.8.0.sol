// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <=0.8.5;

contract BreakingChangesV080 {
    /**
     * - if options.compiler is undefined we leave 1**2**3.
     * - if options.compiler is lower than 0.8.0 we format as (1**2)**3.
     * - if options.compiler is greater than or equal to 0.8.0 we format as
     *   1**(2**3).
     */
    uint a = 1**2**3;

    /**
     * - if options.compiler is undefined we enforce the use of bytes1.
     * - if options.compiler is lower than 0.8.0 we rely on
     *   options.explicitTypes to decide wether to use byte or bytes1.
     * - if options.compiler is greater than or equal to 0.8.0 we enforce the
     *   use of bytes1.
     */
    bytes1 public c;
    byte public g;

    struct S {
        bytes1 c;
        byte g;
    }

    event Event(bytes1 _c, byte _g);

    function func(
        bytes1 _c,
        byte _g
    )
        public
        returns (
            bytes1,
            byte
        )
    {
        emit Event(_c, _g);
        return (_c, _g);
    }
}
