# Style Guide

## Indentation

- [x] Use 4 spaces per indentation level.

## Tabs or Spaces

- [x] Spaces are the preferred indentation method.
- [x] Mixing tabs and spaces should be avoided.

## Blank Lines

- [ ] Surround top level declarations in solidity source with two blank lines.

```Solidity
pragma solidity >=0.4.0 <0.7.0;

    contract A {
        // ...
    }


    contract B {
        // ...
    }


    contract C {
        // ...
    }
```

- [ ] Within a contract surround function declarations with a single blank line.

  Blank lines may be omitted between groups of related one-liners (such as stub functions for an abstract contract)

```Solidity
pragma solidity >=0.4.0 <0.7.0;

contract A {
    function spam() public pure;
    function ham() public pure;
}


contract B is A {
    function spam() public pure {
        // ...
    }

    function ham() public pure {
        // ...
    }
}
```

## Maximum Line Length

Keeping lines under the [PEP 8 recommendation](https://www.python.org/dev/peps/pep-0008/#maximum-line-length) to a maximum of 79 (or 99) characters helps readers easily parse the code.

Wrapped lines should conform to the following guidelines.

1. The first argument should not be attached to the opening parenthesis.
2. One, and only one, indent should be used.
3. Each argument should fall on its own line.
4. The terminating element, :code:`);`, should be placed on the final line by itself.

- [x] Function Calls

```Solidity
thisFunctionCallIsReallyLong(
    longArgument1,
    longArgument2,
    longArgument3
);
```

- [x] Assignment Statements

```Solidity
thisIsALongNestedMapping[being][set][to_some_value] = someFunction(
    argument1,
    argument2,
    argument3,
    argument4
);
```

- [x] Event Definitions and Event Emitters

```Solidity
event LongAndLotsOfArgs(
    address sender,
    address recipient,
    uint256 publicKey,
    uint256 amount,
    bytes32[] options
);

LongAndLotsOfArgs(
    sender,
    recipient,
    publicKey,
    amount,
    options
);
```

## Source File Encoding

- [x] UTF-8 or ASCII encoding is preferred.

## Whitespace in Expressions

Avoid extraneous whitespace in the following situations:

- [x] Immediately inside parenthesis, brackets or braces, with the exception of single line function declarations.

```Solidity
spam(ham[1], Coin({name: "ham"}));
```

- [x] Immediately before a comma, semicolon:

```Solidity
function spam(uint i, Coin coin) public;
```

- [x] More than one space around an assignment or other operator to align with another:

```Solidity
x = 1;
y = 2;
long_variable = 3;
```

- [x] Don't include a whitespace in the fallback function:

```Solidity
function() external {
    ...
}
```

## Control Structures

- [x] The braces denoting the body of a contract, library, functions and structs should:

  - open on the same line as the declaration
  - close on their own line at the same indentation level as the beginning of the declaration.
  - The opening brace should be proceeded by a single space.

```Solidity
pragma solidity >=0.4.0 <0.7.0;

contract Coin {
    struct Bank {
        address owner;
        uint balance;
    }
}
```

- [x] The same recommendations apply to the control structures `if`, `else`, `while`, and `for`.

  Additionally there should be a single space between the control structures `if`, `while`, and `for` and the parenthetic block representing the conditional, as well as a single space between the conditional parenthetic block and the opening brace.

```Solidity
if (...) {
    ...
}

for (...) {
    ...
}
```

- [ ] For control structures whose body contains a single statement, omitting the braces is ok _if_ the statement is contained on a single line.

```Solidity
if (x < 10)
    x += 1;
```

- [x] For `if` blocks which have an `else` or `else if` clause, the `else` should be placed on the same line as the `if`'s closing brace. This is an exception compared to the rules of other block-like structures.

```Solidity
if (x < 3) {
    x += 1;
} else if (x > 7) {
    x -= 1;
} else {
    x = 5;
}


if (x < 3)
    x += 1;
else
    x -= 1;
```

## Function Declaration

- [x] For short function declarations, it is recommended for the opening brace of the function body to be kept on the same line as the function declaration.

  The closing brace should be at the same indentation level as the function declaration.

  The opening brace should be preceded by a single space.

```Solidity
function increment(uint x) public pure returns (uint) {
    return x + 1;
}

function increment(uint x) public pure onlyowner returns (uint) {
    return x + 1;
}
```

- [x] The visibility modifier for a function should come before any custom modifiers.

```Solidity
function kill() public onlyowner {
    selfdestruct(owner);
}
```

- [x] For long function declarations, it is recommended to drop each argument onto it's own line at the same indentation level as the function body. The closing parenthesis and opening bracket should be placed on their own line as well at the same indentation level as the function declaration.

```Solidity
function thisFunctionHasLotsOfArguments(
    address a,
    address b,
    address c,
    address d,
    address e,
    address f
)
    public
{
    doSomething();
}
```

- [x] If a long function declaration has modifiers, then each modifier should be dropped to its own line.

```Solidity
function thisFunctionNameIsReallyLong(address x, address y, address z)
    public
    onlyowner
    priced
    returns (address)
{
    doSomething();
}

function thisFunctionNameIsReallyLong(
    address x,
    address y,
    address z,
)
    public
    onlyowner
    priced
    returns (address)
{
    doSomething();
}
```

- [x] Multiline output parameters and return statements should follow the same style recommended for wrapping long lines found in the [Maximum Line Length](#maximum_line_length) section.

```Solidity
function thisFunctionNameIsReallyLong(
    address a,
    address b,
    address c
)
    public
    returns (
        address someAddressName,
        uint256 LongArgument,
        uint256 Argument
    )
{
    doSomething()

    return (
        veryLongReturnArg1,
        veryLongReturnArg2,
        veryLongReturnArg3
    );
}
```

- [ ] For constructor functions on inherited contracts whose bases require arguments, it is recommended to drop the base constructors onto new lines in the same manner as modifiers if the function declaration is long or hard to read.

```Solidity
pragma solidity >=0.4.0 <0.7.0;

// Base contracts just to make this compile
contract B {
    constructor(uint) public {
    }
}


contract C {
    constructor(uint, uint) public {
    }
}


contract D {
    constructor(uint) public {
    }
}


contract A is B, C, D {
    uint x;

    constructor(uint param1, uint param2, uint param3, uint param4, uint param5)
        B(param1)
        C(param2, param3)
        D(param4)
        public
    {
        // do something with param5
        x = param5;
    }
}
```

These guidelines for function declarations are intended to improve readability. Authors should use their best judgement as this guide does not try to cover all possible permutations for function declarations.

## Mappings

- [x] In variable declarations, do not separate the keyword `mapping` from its type by a space. Do not separate any nested `mapping` keyword from its type by whitespace.

```Solidity
mapping(uint => uint) map;
mapping(address => bool) registeredAddresses;
mapping(uint => mapping(bool => Data[])) public data;
mapping(uint => mapping(uint => s)) data;
```

## Variable Declarations

- [x] Declarations of array variables should not have a space between the type and the brackets.

```Solidity
uint[] x;
```

## Other Recommendations

- [ ] Strings should be quoted with double-quotes instead of single-quotes.

```Solidity
str = "foo";
str = "Hamlet says, 'To be or not to be...'";
```

- [x] Surround operators with a single space on either side.

```Solidity
x = 3;
x = 100 / 10;
x += 3 + 4;
x |= y && z;
```

- [ ] Operators with a higher priority than others can exclude surrounding whitespace in order to denote precedence. This is meant to allow for improved readability for complex statement. You should always use the same amount of whitespace on either side of an operator:

```Solidity
x = 2**3 + 5;
x = 2*y + 3*z;
x = (a+b) * (a-b);
```
