const { ethers } = require("hardhat");

async function main() {
    //Cambiar "NFTClase" por "Sales", ejecutamos y repetimos con "User" (Hacer npx hardhat compile primero antes de deployear)
    const NFT = await ethers.getContractFactory("Sales");
    const nfts = await NFT.deploy();
    const txHash = nfts.deployTransaction.hash;
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.log("Contract deployed at address: ", txReceipt.contractAddress);
}

main()
.then(() => {process.exit(0)})
.catch((error) => {
    console.log(error);
    process.exit(1);
})