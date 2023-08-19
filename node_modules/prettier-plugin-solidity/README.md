# prettier-plugin-solidity

[![Telegram](/assets/telegram-badge.svg)](https://t.me/joinchat/Je2WJFCfKJ_mht1XdhBh6w)
[![Twitter Follow](https://img.shields.io/twitter/follow/PrettierSol.svg?style=social)](https://twitter.com/PrettierSol)

<p align="center">
  <img width="375" height="375" src="https://user-images.githubusercontent.com/1022054/59317198-f1149b80-8d15-11e9-9b0f-0c5e7d4b8b81.png">
</p>

A [Prettier plugin](https://prettier.io/docs/en/plugins.html) for automatically formatting your [Solidity](https://github.com/ethereum/solidity) code.

If you like this project, please consider contributing to our [Gitcoin grant](https://gitcoin.co/grants/1534/prettier-solidity)!

## Installation and usage

Install both `prettier` and `prettier-plugin-solidity`:

```
npm install --save-dev prettier prettier-plugin-solidity
```

Run prettier in your contracts:

```
npx prettier --write 'contracts/**/*.sol'
```

You can add a script for running prettier on all your contracts:

```
"prettier": "prettier --write 'contracts/**/*.sol'"
```

Or you can use it as part of your linting to check that all your code is prettified:

```
"lint": "prettier --list-different 'contracts/**/*.sol'"
```

## Who's using it?

These are some of the projects using Prettier Solidity:

- [Bancor](https://app.bancor.network)
- [Gelato](https://gelato.network/)
- [Gnosis Protocol](https://docs.gnosis.io/protocol/)
- [PieDAO](https://www.piedao.org/)
- [Sablier](https://sablier.finance/)
- [Synthetix](https://www.synthetix.io)
- [The Sandbox](https://www.sandbox.game/en/)
- [UMA](https://umaproject.org/)
- [Uniswap](https://uniswap.org)

## Configuration File

Prettier provides a flexible system to configure the formatting rules of a project. For more information please refer to the [documentation](https://prettier.io/docs/en/configuration.html).
The following is the default configuration internally used by this plugin.

```json
{
  "overrides": [
    {
      "files": "*.sol",
      "options": {
        "printWidth": 80,
        "tabWidth": 4,
        "useTabs": false,
        "singleQuote": false,
        "bracketSpacing": false,
        "explicitTypes": "always"
      }
    }
  ]
}
```

Note the use of the [overrides property](https://prettier.io/docs/en/configuration.html#configuration-overrides) which allows for multiple configurations in case there are other languages in the project (i.e. JavaScript, JSON, Markdown).

Most options are described in Prettier's [documentation](https://prettier.io/docs/en/options.html).

### Explicit Types

Solidity provides the aliases `uint` and `int` for `uint256` and `int256` respectively.
Multiple developers will have different coding styles and prefer one over another.
This option was added to standardize the code across a project and enforce the usage of one alias over another.

Valid options:

- `"always"`: Prefer explicit types (`uint256`, `int256`, etc.)
- `"never"`: Prefer type aliases (`uint`, `int`, etc.).
- `"preserve"`: Respect the type used by the developer.

| Default    | CLI Override                                 | API Override                                 |
| ---------- | -------------------------------------------- | -------------------------------------------- |
| `"always"` | `--explicit-types <always\|never\|preserve>` | `explicitTypes: "<always\|never\|preserve>"` |

```Solidity
// Input
uint public a;
int256 public b;

// "explicitTypes": "always"
uint256 public a;
int256 public b;

// "explicitTypes": "never"
uint public a;
int public b;

// "explicitTypes": "preserve"
uint public a;
int256 public b;
```

Note: if the compiler option is provided and is lesser than 0.8.0, explicitTypes will also consider the alias `byte` for the explicit type `bytes1`.

Note: switching between `uint` and `uint256` does not alter the bytecode at all and we have implemented tests for this. However, there will be a change in the AST reflecting the switch.

### Compiler (experimental)

Many versions of the Solidity compiler have changes that affect how the code should be formatted. This plugin, by default, tries to format the code in the most compatible way that it's possible, but you can use the experimental `compiler` option to nudge it in the right direction.

One example of this are import directives. Before `0.7.4`, the compiler didn't accept multi-line import statements, so we always format them in a single line. But if you use the `compiler` option to indicate that you are using a version greater or equal than `0.7.4`, the plugin will use multi-line imports when it makes sense.

The solidity versions taken into consideration during formatting are:

- `v0.7.4`: Versions prior `0.7.4` had a bug that would not interpret correctly imports unless they are formatted in a single line.

  ```Solidity
  // Input
  import { Foo as Bar } from "/an/extremely/long/location";

  // "compiler": undefined
  import { Foo as Bar } from "/an/extremely/long/location";

  // "compiler": "0.7.3" (or lesser)
  import { Foo as Bar } from "/an/extremely/long/location";

  // "compiler": "0.7.4" (or greater)
  import {
      Foo as Bar
  } from "/an/extremely/long/location";
  ```

- `v0.8.0`: Introduced these [changes](https://docs.soliditylang.org/en/v0.8.0/080-breaking-changes.html)

  - The type `byte` has been removed. It was an alias of `bytes1`.
  - Exponentiation is right associative, i.e., the expression `a**b**c` is parsed as `a**(b**c)`. Before 0.8.0, it was parsed as `(a**b)**c`.

  ```Solidity
  // Input
  bytes1 public a;
  byte public b;

  uint public c = 1 ** 2 ** 3;

  // "compiler": undefined
  // "explicitTypes": "never"
  bytes1 public a;
  bytes1 public b;

  uint public c = 1**2**3;

  // "compiler": "0.7.6" (or lesser)
  // "explicitTypes": "never"
  byte public a;
  byte public b;

  uint public c = (1**2)**3;

  // "compiler": "0.8.0" (or greater)
  // "explicitTypes": "never"
  bytes1 public a;
  bytes1 public b;

  uint public c = 1**(2**3);
  ```

You might have a multi-version project, where different files are compiled with different compilers. If that's the case, you can use [overrides](https://prettier.io/docs/en/configuration.html#configuration-overrides) to have a more granular configuration:

```
{
  "overrides": [
    {
      "files": "contracts/v1/**/*.sol",
      "options": {
        "compiler": "0.6.3"
      }
    },
    {
      "files": "contracts/v2/**/*.sol",
      "options": {
        "compiler": "0.8.4"
      }
    }
  ]
}
```

| Default | CLI Override          | API Override           |
| ------- | --------------------- | ---------------------- |
| None    | `--compiler <string>` | `compiler: "<string>"` |

## Integrations

### Vim

To integrate this plugin with vim, first install [`vim-prettier`](https://github.com/prettier/vim-prettier). These
instructions assume you are using [`vim-plug`](https://github.com/junegunn/vim-plug). Add this to your configuration:

```vim
Plug 'prettier/vim-prettier', {
  \ 'do': 'yarn install && yarn add prettier-plugin-solidity',
  \ 'for': [
    \ 'javascript',
    \ 'typescript',
    \ 'css',
    \ 'less',
    \ 'scss',
    \ 'json',
    \ 'graphql',
    \ 'markdown',
    \ 'vue',
    \ 'lua',
    \ 'php',
    \ 'python',
    \ 'ruby',
    \ 'html',
    \ 'swift',
    \ 'solidity'] }
```

We modified the `do` instruction to also install this plugin. Then you'll have to configure the plugin to always use the
version installed in the vim plugin's directory. The vim-plug directory depends on value you use in `call plug#begin('~/.vim/<dir>')`:

```vim
let g:prettier#exec_cmd_path = '~/.vim/plugged/vim-prettier/node_modules/.bin/prettier'
```

To check that everything is working, open a solidity file and run `:Prettier`.

If you also want to autoformat every time you write the buffer, add these lines:

```vim
let g:prettier#autoformat = 0
autocmd BufWritePre *.sol Prettier
```

Now Prettier will be run every time the file is saved.

### VSCode

VSCode is not familiar with the solidity language, so [`solidity`](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) support needs to be installed.

```Bash
code --install-extension JuanBlanco.solidity
```

This extension provides basic integration with Prettier for most cases no further action is needed.

Make sure your editor has format on save set to true.
When you save VSCode will ask you what formatter would you like to use for the solidity language, you can choose `JuanBlanco.solidity`.

At this point VSCode's `settings.json` should have a configuration similar to this:

```JSON
{
  "editor.formatOnSave": true,
  "solidity.formatter": "prettier", // This is the default so it might be missing.
  "[solidity]": {
    "editor.defaultFormatter": "JuanBlanco.solidity"
  }
}
```

If you want more control over other details, you should proceed to install [`prettier-vscode`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

```Bash
code --install-extension esbenp.prettier-vscode
```

To interact with 3rd party plugins, `prettier-vscode` will look in the project's npm modules, so you'll need to have `prettier` and `prettier-plugin-solidity` in your `package.json`

```
npm install --save-dev prettier prettier-plugin-solidity
```

This will allow you to specify the version of the plugin in case you want to use the latest version of the plugin or need to freeze the formatting since new versions of this plugin will implement tweaks on the possible formats.

You'll have to let VSCode what formatter you prefer.
This can be done by opening the command palette and executing:

```
>Preferences: Configure Language Specific Settings...

# Select Language
solidity
```

Now VSCode's `settings.json` should have this:

```JSON
{
  "editor.formatOnSave": true,
  "[solidity]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

Note: By design, Prettier prioritizes a local over a global configuration. If you have a `.prettierrc` file in your porject, your VSCode's default settings or rules in `settings.json` are ignored ([prettier/prettier-vscode#1079](https://github.com/prettier/prettier-vscode/issues/1079)).

## Edge cases

Prettier Solidity does its best to be pretty and consistent, but in some cases it falls back to doing things that are less than ideal.

### Modifiers in constructors

Modifiers with no arguments are formatted with their parentheses removed, except for constructors. The reason for this is that Prettier Solidity cannot always tell apart a modifier from a base constructor. So modifiers in constructors are not modified. For example, this:

```solidity
contract Foo is Bar {
  constructor() Bar() modifier1 modifier2() modifier3(42) {}

  function f() modifier1 modifier2() modifier3(42) {}
}
```

will be formatted as

```solidity
contract Foo is Bar {
  constructor() Bar() modifier1 modifier2() modifier3(42) {}

  function f() modifier1 modifier2 modifier3(42) {}
}
```

Notice that the unnecessary parentheses in `modifier2` were removed in the function but not in the constructor.

## Contributing

1. [Fork it](https://github.com/prettier-solidity/prettier-plugin-solidity/fork)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. All existing test and coverage must pass (`npm run test:all`), if coverage drops below 100% add missing tests.
5. Push to the branch (`git push origin feature/fooBar`)
6. Create a new Pull Request

## License

Distributed under the MIT license. See [LICENSE](LICENSE) for more information.
