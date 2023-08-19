run_spec(__dirname, ['solidity-parse'], { compiler: '0.7.4' });
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.7.4',
  bracketSpacing: true
});
run_spec(__dirname, ['solidity-parse'], { compiler: '0.7.3' });
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.7.3',
  bracketSpacing: true
});
run_spec(__dirname, ['solidity-parse']);
run_spec(__dirname, ['solidity-parse'], {
  bracketSpacing: true
});
