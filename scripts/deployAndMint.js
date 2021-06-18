const hre = require("hardhat");

const nfts = [
  {name: "Butterfly", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/butterfly.json"},
  {name: "Cock", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/cock.json"},
  {name: "Cow", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/cow.json"},
  {name: "Dog", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/dog.json"},
  {name: "Eagle", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/eagle.json"},
  {name: "Fox", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/fox.json"},
  {name: "Jellyfish", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/jellyfish.json"},
  {name: "Lion", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/lion.json"},
  {name: "Panda", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/panda.json"},
  {name: "Parrot", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/parrot.json"},
  {name: "Peacock", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/peacock.json"},
  {name: "Penguin", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/penguins.json"},
  {name: "Turtle", cid: "QmXUSSgzCQUNezLpo9Xn8TSmgkPqL3SgT8RpfyyNjGgimN/turtle.json"},
]

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const NFTContractFactory = await hre.ethers.getContractFactory("MyNFT");
  const NFTContract = await NFTContractFactory.deploy();

  await NFTContract.deployed();

  console.log("Contract deployed to:", NFTContract.address);
  console.log("Minting NFTs to the contract with the deployer address : ", deployer.address);

  const promises = nfts.map( async (nft) => {
    console.log('Deploying: ', nft.name, nft.cid);
    await NFTContract.mint(deployer.address, nft.cid);
  })

  await Promise.all(promises);

  const bal = await NFTContract.balanceOf(deployer.address);
  console.log('Balance: ', bal.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });