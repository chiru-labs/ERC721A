[![Docs][docs-shield]][docs-url]
[![NPM][npm-shield]][npm-url]
[![CI][ci-shield]][ci-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Coverage][coverage-shield]][coverage-url]
<!-- OTHER BADGES -->
<!-- [![Contributors][contributors-shield]][contributors-url] -->
<!-- [![Forks][forks-shield]][forks-url] -->
<!-- [![Stargazers][stars-shield]][stars-url] -->

<!-- ANNOUNCEMENT -->

> **📢 Version 4.x introduces several breaking changes. [Please refer to the documentation for more details.](https://chiru-labs.github.io/ERC721A/#/migration)**

_We highly recommend reading the migration guide_, **especially** _the part on [`supportsInterface`](https://chiru-labs.github.io/ERC721A/#/migration?id=supportsinterface) if you are using with OpenZeppelin extensions_ (e.g. ERC2981).

<!-- ABOUT THE PROJECT -->

## About The Project

The goal of ERC721A is to provide a fully compliant implementation of IERC721 with significant gas savings for minting multiple NFTs in a single transaction. This project and implementation will be updated regularly and will continue to stay up to date with best practices.

The [Azuki](https://twitter.com/Azuki) team created ERC721A for its sale on 1/12/22. There was significant demand for 8700 tokens made available to the public, and all were minted within minutes. The network BASEFEE remained low despite huge demand, resulting in low gas costs for minters, while minimizing network disruption for the wider ecosystem as well.

![Gas Savings](https://pbs.twimg.com/media/FIdILKpVQAEQ_5U?format=jpg&name=medium)

For more information on how ERC721A works under the hood, please visit our [blog](https://www.azuki.com/erc721a). To find other projects that are using ERC721A, please visit [erc721a.org](https://www.erc721a.org) and our [curated projects list](https://github.com/chiru-labs/ERC721A/blob/main/projects.md).

**Chiru Labs is not liable for any outcomes as a result of using ERC721A.** DYOR.

<!-- Docs -->

## Docs

https://chiru-labs.github.io/ERC721A/

<!-- Upgradeable Version -->

## Upgradeable Version

https://github.com/chiru-labs/ERC721A-Upgradeable

<!-- Installation -->

## Installation

```sh

npm install --save-dev erc721a

```

<!-- USAGE EXAMPLES -->

## Usage

Once installed, you can use the contracts in the library by importing them:

```solidity
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";

contract Azuki is ERC721A {
    constructor() ERC721A("Azuki", "AZUKI") {}

    function mint(uint256 quantity) external payable {
        // `_mint`'s second argument now takes in a `quantity`, not a `tokenId`.
        _mint(msg.sender, quantity);
    }
}

```

<!-- ROADMAP -->

## Roadmap

- [ ] Improve general repo and code quality (workflows, comments, etc.)
- [ ] Add more documentation on benefits of using ERC721A
- [ ] Maintain full test coverage

See the [open issues](https://github.com/chiru-labs/ERC721A/issues) for a full list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- ROADMAP -->

### Running tests locally

1. `npm install`
2. `npm run test`

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!-- CONTACT -->

## Contact

- 2pm.flow (owner) - [@2pmflow](https://twitter.com/2pmflow)
- location tba (owner) - [@locationtba](https://twitter.com/locationtba)
- cygaar (maintainer) - [@0xCygaar](https://twitter.com/0xCygaar)
- vectorized.eth (maintainer) - [@optimizoor](https://twitter.com/optimizoor)

Project Link: [https://github.com/chiru-labs/ERC721A](https://github.com/chiru-labs/ERC721A)

<!-- MARKDOWN LINKS & IMAGES -->

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[docs-shield]: https://img.shields.io/badge/docs-%F0%9F%93%84-blue?style=for-the-badge
[docs-url]: https://chiru-labs.github.io/ERC721A/
[npm-shield]: https://img.shields.io/npm/v/erc721a.svg?style=for-the-badge
[npm-url]: https://www.npmjs.com/package/erc721a
[ci-shield]: https://img.shields.io/github/actions/workflow/status/chiru-labs/ERC721A/run_tests.yml?label=build&style=for-the-badge&branch=main
[ci-url]: https://github.com/chiru-labs/ERC721A/actions/workflows/run_tests.yml
[contributors-shield]: https://img.shields.io/github/contributors/chiru-labs/ERC721A.svg?style=for-the-badge
[contributors-url]: https://github.com/chiru-labs/ERC721A/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/chiru-labs/ERC721A.svg?style=for-the-badge
[forks-url]: https://github.com/chiru-labs/ERC721A/network/members
[stars-shield]: https://img.shields.io/github/stars/chiru-labs/ERC721A.svg?style=for-the-badge
[stars-url]: https://github.com/chiru-labs/ERC721A/stargazers
[issues-shield]: https://img.shields.io/github/issues/chiru-labs/ERC721A.svg?style=for-the-badge
[issues-url]: https://github.com/chiru-labs/ERC721A/issues
[license-shield]: https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge
[license-url]: https://github.com/chiru-labs/ERC721A/blob/main/LICENSE.txt
[coverage-shield]: https://img.shields.io/codecov/c/gh/chiru-labs/ERC721A?style=for-the-badge
[coverage-url]: https://codecov.io/gh/chiru-labs/ERC721A
[product-screenshot]: images/screenshot.png
