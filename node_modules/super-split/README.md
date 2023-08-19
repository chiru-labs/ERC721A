# Super-Split

> 🔪  split string by delimiter array - delimiters retained

[![Build Status](https://travis-ci.org/F1LT3R/super-split.svg?branch=master)](https://travis-ci.org/F1LT3R/super-split)
[![Coverage Status](https://coveralls.io/repos/github/F1LT3R/super-split/badge.svg?branch=master)](https://coveralls.io/github/F1LT3R/super-split?branch=master)
[![NPM Version](https://img.shields.io/npm/v/super-split.svg)](https://www.npmjs.com/package/super-split)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## Install

```
$ yarn add super-split
```

## Usage

### Split a string

```js
const superSplit = require('super-split')

const str = 'A+B-C'
const delimiters = ['+', '-']
const result = superSplit(str, delimiters)
```

Result:

```js
['A', '+', 'B', '-', 'C']
```

### Split with ANSI

```js
const str = 'I like to \u001b[34mmove it\u001b[39m, move it.'

const delimiters = ['\u001b[34m', '\u001b[39m']

const result = superSplit(str, delimiters)
```

Result:

```js
['I like to ', '\u001b[34m', 'move it', '\u001b[39m', ', move it.']
```


### Split Array

```js
const ary = [':-)', 'o_O']

const delimiters = ['-', '_']

const result = superSplit(ary, delimiters)
```

Result:

```js
[':', '-', ')', 'o', '_', 'O']
```