// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract ShiftRNoParentheses {
    function shiftRAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b + c;
    }

    function shiftRSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b - c;
    }

    function shiftRMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b * c;
    }

    function shiftRDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b / c;
    }

    function shiftRMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b % c;
    }

    function shiftRExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b ** c;
    }

    function shiftRShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b << c;
    }

    function shiftRShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b >> c;
    }

    function shiftRBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b & c;
    }

    function shiftRBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b | c;
    }

    function shiftRBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a >> b ^ c;
    }
}
