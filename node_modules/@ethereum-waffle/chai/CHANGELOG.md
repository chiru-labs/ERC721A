# @ethereum-waffle/chai

## 3.4.1

### Patch Changes

- 5407af7: changeEtherBalances/changeEtherBalance compatablity with london hardfork

## 3.4.0

### Minor Changes

- 80d215b: - Fix vulnerabilities shown by `yarn audit`
  - Fix typings in `closeTo` matcher
  - Add `flattenSingleFile` function to compiler

### Patch Changes

- Updated dependencies [80d215b]
  - @ethereum-waffle/provider@3.4.0

## 3.3.1

### Patch Changes

- dc7afe4: Bugfix: Handle messages with special symbols in `revertedWith`
- Updated dependencies [6952eb9]
  - @ethereum-waffle/provider@3.3.1

## 3.3.0

### Minor Changes

- 1d7b466: Fix changeTokenBalance and changeTokenBalances matchers for contracts with overloaded balanceOf

  New matchers for BigNumber: within and closeTo

  Typechain integration

  Fix revertedWith functionality

### Patch Changes

- Updated dependencies [1d7b466]
  - @ethereum-waffle/provider@3.3.0
