async function main() {
  // We get the contract to deploy
  const ERC721A = await ethers.getContractFactory('ERC721A');
  console.log('Deploying ERC721A...');
  const erc721a = await ERC721A.deploy("name", "symbol", 10);
  await erc721a.deployed();
  console.log('ERC721A deployed to:', erc721a.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });