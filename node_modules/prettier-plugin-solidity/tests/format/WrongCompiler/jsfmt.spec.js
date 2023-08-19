// Should warn twice
run_spec(__dirname, ['solidity-parse'], { compiler: '0.8.4' });
// Should warn once
run_spec(__dirname, ['solidity-parse'], {
  compiler: 'v0.7.5-nightly.2020.11.9+commit.41f50365'
});
// Should not warn
run_spec(__dirname, ['solidity-parse'], {
  compiler: 'v0.7.3+commit.9bfce1f6'
});
