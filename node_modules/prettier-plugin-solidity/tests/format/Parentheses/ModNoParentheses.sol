// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract ModNoParentheses {
    function modAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b + c;
    }

    function modSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b - c;
    }

    function modMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b * c;
    }

    function modDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b / c;
    }

    function modMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b % c;
    }

    function modExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b ** c;
    }

    function modShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b << c;
    }

    function modShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b >> c;
    }

    function modBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b & c;
    }

    function modBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b | c;
    }

    function modBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a % b ^ c;
    }
}
