contract StringLiteral {
    bytes32 public constant PERMIT_TYPEHASH = keccak256(
        "Permit("
            "address owner,"
            "address spender,"
            "uint256 value,"
            "uint256 nonce,"
            "uint256 deadline"
        ")"
    );
}
