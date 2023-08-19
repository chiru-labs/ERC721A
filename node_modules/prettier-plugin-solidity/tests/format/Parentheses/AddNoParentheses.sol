// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract AddNoParentheses {
    function addAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b + c;
    }

    function addSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b - c;
    }

    function addMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b * c;
    }

    function addDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b / c;
    }

    function addMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b % c;
    }

    function addExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b ** c;
    }

    function addShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b << c;
    }

    function addShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b >> c;
    }

    function addBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b & c;
    }

    function addBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b | c;
    }

    function addBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a + b ^ c;
    }
}
