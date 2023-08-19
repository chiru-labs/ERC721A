# ansi-mark

> 🖊️  a highlight marker for your color ansi strings

[![Build Status](https://travis-ci.org/F1LT3R/ansi-mark.svg?branch=master)](https://travis-ci.org/F1LT3R/ansi-mark)
[![Coverage Status](https://coveralls.io/repos/github/F1LT3R/ansi-mark/badge.svg?branch=master)](https://coveralls.io/github/F1LT3R/ansi-mark?branch=master)
[![NPM Version](https://img.shields.io/npm/v/ansi-mark.svg)](https://www.npmjs.com/package/ansi-mark)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## Before and After

![Before ANSI-Mark](before.png)

-

![After ANSI-Mark](after.png)

## Explanation

If your CLI app outputs strings containing ANSI color codes, like this...

```js
const ansiStr = '\u001b[37m\u001b[33m<\u001b[36mbody\u001b[33m>\u001b[37m            \u001b[39m\n\u001b[37m\t\u001b[33m<\u001b[36mspan\u001b[33m>\u001b[37mGood\u001b[33m</\u001b[36mspan\u001b[33m>\u001b[37m\u001b[39m\n\u001b[37m\t\u001b[33m<\u001b[36mspan\u001b[33m>\u001b[37mBad\u001b[33m<\u001b[36mspan\u001b[33m>\u001b[37m  \u001b[39m\n\u001b[37m\u001b[33m<\u001b[36mbody\u001b[33m>\u001b[37m            \u001b[39m\n\u001b[37m\u001b[39m'
console.log(ansiStr)
```

![Before ANSI-Mark](before.png)

... then your ANSI string contains visible, and invisible characters. This makes it difficult if you want to highlight a portion of your string. The start and end position of your highlight needs to account for the invisible characters.

But wouldn't it be simpler for everyone if there was a Node Module that let you highlight a sub-string using the offsets of the visible characters?

That is what `ansi-mark` does:

```js
const chalk = require('chalk')

const opts = {
    start: {line: 3, column: 11},
    end: {line: 4, column: 7},
    color: chalk.bgRed.white.bold,
    resetColor: true
}

const result = ansiMark(ansiStr, opts)
```

![After ANSI-Mark](after.png)

## Keep Colors

If you want to keep the underlying colors in the portion of the string you are highlighting, use the `resetColor: false` option:

```js
const chalk = require('chalk')

const opts = {
    start: {line: 3, column: 11},
    end: {line: 4, column: 7},
    color: chalk.bgBlack
    resetColor: false
}

const result = ansiMark(ansiStr, opts)
```

![After ANSI-Mark Keep Color](after-keep-color.png)

## Using Offsets

You can also highlight by a linear character `offset` rather than `lines` and `columns`

```js
const chalk = require('chalk')

const opts = {
    start: 46,
    end: 64,
    color: chalk.bgRed.white.bold,
    resetColor: true
}

const result = ansiMark(ansiStr, opts)
```

![After ANSI-Mark](after.png)

## Install

```
$ yarn add ansi-mark
```
