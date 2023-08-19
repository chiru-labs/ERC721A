// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract BitOrNoParentheses {
    function bitOrAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b + c;
    }

    function bitOrSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b - c;
    }

    function bitOrMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b * c;
    }

    function bitOrDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b / c;
    }

    function bitOrMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b % c;
    }

    function bitOrExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b ** c;
    }

    function bitOrShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b << c;
    }

    function bitOrShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b >> c;
    }

    function bitOrBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b & c;
    }

    function bitOrBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b | c;
    }

    function bitOrBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a | b ^ c;
    }
}
