// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract SubNoParentheses {
    function subAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b + c;
    }

    function subSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b - c;
    }

    function subMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b * c;
    }

    function subDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b / c;
    }

    function subMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b % c;
    }

    function subExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b ** c;
    }

    function subShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b << c;
    }

    function subShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b >> c;
    }

    function subBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b & c;
    }

    function subBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b | c;
    }

    function subBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a - b ^ c;
    }
}
