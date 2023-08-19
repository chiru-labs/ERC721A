// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract DivNoParentheses {
    function divAdd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b + c;
    }

    function divSub(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b - c;
    }

    function divMul(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b * c;
    }

    function divDiv(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b / c;
    }

    function divMod(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b % c;
    }

    function divExp(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b ** c;
    }

    function divShiftL(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b << c;
    }

    function divShiftR(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b >> c;
    }

    function divBitAnd(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b & c;
    }

    function divBitOr(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b | c;
    }

    function divBitXor(uint256 a, uint256 b, uint256 c)
        public
        pure
        returns (uint256)
    {
        return a / b ^ c;
    }
}
