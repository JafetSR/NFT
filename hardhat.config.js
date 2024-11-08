require('dotenv').config({path:require('find-config')('.env')});
require('@nomiclabs/hardhat-ethers');

const {API_URL, PRIVATE_KEY} = process.env

module.exports = {
  solidity: "0.8.27",
  defaultNetwork: 'sepolia',
  networks: {
    sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};