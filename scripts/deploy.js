const { ethers } = require("hardhat");

// async function main() {
//     //Cambiar "NFTClase" por "Sales", ejecutamos y repetimos con "User" (Hacer npx hardhat compile primero antes de deployear)
//     const NFT = await ethers.getContractFactory("Sales");
//     const nfts = await NFT.deploy();
//     const txHash = nfts.deployTransaction.hash;
//     const txReceipt = await ethers.provider.waitForTransaction(txHash);
//     console.log("Contract deployed at address: ", txReceipt.contractAddress);
// }

// main()
// .then(() => {process.exit(0)})
// .catch((error) => {
//     console.log(error);
//     process.exit(1);
// })

async function multiDeploy() {
    const owners = [
        "0xb1470A2f7d60ec5DE45fCD2a4A6E9D7a2b0b941e",       //Jafet
        "0x7410Ad86D6134A5D477e54b59F0123e163398c9D",       //Cabra
        "0xd3039c7baC51D622279F7DD4c4d35715aD8096f9"        //Carla
    ]
    const requiredApprovals = 2;
    const WalletMultiSig = await ethers.getContractFactory("WalletMultiSig")
    const wallet = await WalletMultiSig.deploy(owners, requiredApprovals);
    console.log("WalletMultiSig deployed at: ", wallet.address);
}

multiDeploy().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
})