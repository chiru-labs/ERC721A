<!-- PROJECT SHIELDS -->

<!--

*** I'm using markdown "reference style" links for readability.

*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).

*** See the bottom of this document for the declaration of the reference variables

*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.

*** https://www.markdownguide.org/basic-syntax/#reference-style-links

-->

[![Contributors][contributors-shield]][contributors-url]

[![Forks][forks-shield]][forks-url]

[![Stargazers][stars-shield]][stars-url]

[![Issues][issues-shield]][issues-url]

[![MIT License][license-shield]][license-url]

<!-- ABOUT THE PROJECT -->

## About The Project

The goal of ERC721A is to provide a fully compliant implementation of IERC721 with significant gas savings for minting multiple NFTs in a single transaction. This project and implementation will be updated regularly and will continue to stay up to date with best practices.

The [Azuki](https://twitter.com/azukizen) team created ERC721A for its sale on 1/12/22. There was significant demand for 8700 tokens made available to the public, and all were minted within minutes. The network BASEFEE remained low despite huge demand, resulting in low gas costs for minters, while minimizing network disruption for the wider ecosystem as well.

For more information on how ERC721A works under the hood, please visit our [blog](https://www.azuki.com/erc721a), which dives into savings and different optimizations.

![Gas Savings](https://pbs.twimg.com/media/FIdILKpVQAEQ_5U?format=jpg&name=medium)

For more information on how ERC721A works under the hood, please visit our [blog](https://www.azuki.com/erc721a). To find other projects that are using ERC721A, please visit [erc721a.org](https://www.erc721a.org).

**Chiru Labs is not liable for any outcomes as a result of using ERC721A.** DYOR.

<!-- Installation -->

## Installation

```sh

npm install --save-dev erc721a

```

<!-- USAGE EXAMPLES -->

## Usage

Once installed, you can use the contracts in the library by importing them:

```solidity
pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";

contract Azuki is ERC721A {
  constructor() ERC721A("Azuki", "AZUKI", 5) {}

  function mint(uint256 quantity) external payable {
    // _safeMint's second argument now takes in a quantity, not a tokenId.
    _safeMint(msg.sender, quantity);
  }
}

```

<!-- ROADMAP -->

## Roadmap

- [] Add burn function

- [] Add flexibility for the first token id to not start at 0

- [] Move \_setOwnersExplicit to an extension

- [] Add more documentation on benefits of using ERC721A

- [] Increase test coverage

- [] Add CI pipeline

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

2. `npm node`

3. `npm test`

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!-- CONTACT -->

## Contact

- 2pm.flow (owner) - [@2pmflow](https://twitter.com/2pmflow)

- location tba (owner) - [@locationtba](https://twitter.com/locationtba)

- cygaar (maintainer) - [@cygaar_dev](https://twitter.com/cygaar_dev)

Project Link: [https://github.com/chiru-labs/ERC721A](https://github.com/chiru-labs/ERC721A)

<!-- MARKDOWN LINKS & IMAGES -->

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/chiru-labs/ERC721A.svg?style=for-the-badge
[contributors-url]: https://github.com/chiru-labs/ERC721A/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/chiru-labs/ERC721A.svg?style=for-the-badge
[forks-url]: https://github.com/chiru-labs/ERC721A/network/members
[stars-shield]: https://img.shields.io/github/stars/chiru-labs/ERC721A.svg?style=for-the-badge
[stars-url]: https://github.com/chiru-labs/ERC721A/stargazers
[issues-shield]: https://img.shields.io/github/issues/chiru-labs/ERC721A.svg?style=for-the-badge
[issues-url]: https://github.com/chiru-labs/ERC721A/issues
[license-shield]: https://img.shields.io/github/license/chiru-labs/ERC721A.svg?style=for-the-badge
[license-url]: https://github.com/chiru-labs/ERC721A/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png
