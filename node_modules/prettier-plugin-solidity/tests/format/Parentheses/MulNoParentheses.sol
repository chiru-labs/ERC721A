// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract MulNoParentheses {
    function mulAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b + c;
    }

    function mulSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b - c;
    }

    function mulMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b * c;
    }

    function mulDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b / c;
    }

    function mulMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b % c;
    }

    function mulExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b ** c;
    }

    function mulShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b << c;
    }

    function mulShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b >> c;
    }

    function mulBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b & c;
    }

    function mulBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b | c;
    }

    function mulBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a * b ^ c;
    }
}
