// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract ShiftLNoParentheses {
    function shiftLAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b + c;
    }

    function shiftLSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b - c;
    }

    function shiftLMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b * c;
    }

    function shiftLDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b / c;
    }

    function shiftLMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b % c;
    }

    function shiftLExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b ** c;
    }

    function shiftLShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b << c;
    }

    function shiftLShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b >> c;
    }

    function shiftLBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b & c;
    }

    function shiftLBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b | c;
    }

    function shiftLBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a << b ^ c;
    }
}
