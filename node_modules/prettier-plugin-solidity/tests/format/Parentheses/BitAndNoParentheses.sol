// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract BitAndNoParentheses {
    function bitAndAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b + c;
    }

    function bitAndSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b - c;
    }

    function bitAndMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b * c;
    }

    function bitAndDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b / c;
    }

    function bitAndMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b % c;
    }

    function bitAndExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b ** c;
    }

    function bitAndShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b << c;
    }

    function bitAndShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b >> c;
    }

    function bitAndBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b & c;
    }

    function bitAndBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b | c;
    }

    function bitAndBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a & b ^ c;
    }
}
