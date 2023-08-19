run_spec(__dirname, ['solidity-parse']);
run_spec(__dirname, ['solidity-parse'], { explicitTypes: 'never' });
run_spec(__dirname, ['solidity-parse'], { explicitTypes: 'preserve' });
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.8.0'
});
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.8.0',
  explicitTypes: 'never'
});
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.8.0',
  explicitTypes: 'preserve'
});
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.7.0',
  explicitTypes: 'always'
});
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.7.0',
  explicitTypes: 'never'
});
run_spec(__dirname, ['solidity-parse'], {
  compiler: '0.7.0',
  explicitTypes: 'preserve'
});
