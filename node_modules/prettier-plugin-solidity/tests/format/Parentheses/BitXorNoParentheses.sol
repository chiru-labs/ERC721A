// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract BitXorNoParentheses {
    function bitXorAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b + c;
    }

    function bitXorSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b - c;
    }

    function bitXorMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b * c;
    }

    function bitXorDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b / c;
    }

    function bitXorMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b % c;
    }

    function bitXorExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b ** c;
    }

    function bitXorShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b << c;
    }

    function bitXorShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b >> c;
    }

    function bitXorBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b & c;
    }

    function bitXorBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b | c;
    }

    function bitXorBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a ^ b ^ c;
    }
}
