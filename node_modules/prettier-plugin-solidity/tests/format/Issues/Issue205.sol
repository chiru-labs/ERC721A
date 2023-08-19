contract Example {
    using SafeMath for uint256;
    
    struct BalanceState {
        uint256 balance;
    }

    mapping(address => mapping(address => BalanceState)) private balanceStates;
    function example(address token, uint amount) public {
        balanceStates[msg.sender][token].balance = balanceStates[msg.sender][token].balance.sub(amount);
    }
}
