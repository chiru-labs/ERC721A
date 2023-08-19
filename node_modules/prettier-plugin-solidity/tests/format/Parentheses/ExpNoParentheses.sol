// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract ExpNoParentheses {
    function expAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b + c;
    }

    function expSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b - c;
    }

    function expMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b * c;
    }

    function expDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b / c;
    }

    function expMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b % c;
    }

    function expExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b ** c;
    }

    function expShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b << c;
    }

    function expShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b >> c;
    }

    function expBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b & c;
    }

    function expBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b | c;
    }

    function expBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ** b ^ c;
    }
}
