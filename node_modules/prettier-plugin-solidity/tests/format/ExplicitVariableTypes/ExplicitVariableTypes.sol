// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract VariableTypesMixed {
    uint256 public a;
    int256 public b;
    uint public e;
    int public f;

    struct S {
        uint a;
        int b;
        uint256 e;
        int256 f;
    }

    event Event(uint _a, int256 _b, uint256 _e, int _f);

    function func(
        uint256 _a,
        int256 _b,
        uint _e,
        int _f
    )
        public
        returns (
            uint,
            int256,
            uint256,
            int
        )
    {
        emit Event(_a, _b, _e, _f);
        return (_a, _b, _e, _f);
    }
}
