run_spec(__dirname, ['solidity-parse'], { compiler: '0.8.6' });
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.8.6',
  explicitTypes: 'never'
});
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.8.6',
  explicitTypes: 'preserve'
});
