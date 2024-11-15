require ('dotenv').config({path:require('find-config')('.env')})

const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/Users.sol/Users.json')

const {
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    USER_CONTRACT
} = process.env;

async function createTransaction(provider, method, params) {
    console.log(params)
    const etherInterface = new ethers.utils.Interface(contract.abi)
    const nonce = await provider.getTransactionCount(PUBLIC_KEY, 'latest')
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId} = network;
    const transaction = {
        from: PUBLIC_KEY,
        to: USER_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method, params)
    }
    return transaction;
}

async function createUser(firstName, lastName) {
    console.log(`API URL: ${API_URL}, PRIVATE: ${PRIVATE_KEY}`)
    console.log([firstName, lastName])
    const provider = new ethers.providers.JsonRpcProvider(API_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    const transaction = await createTransaction(provider, "insertUser", [firstName, lastName]);
    const estimateGas = await provider.estimateGas(transaction);
    console.log("Despues del gas: " + estimateGas)
    transaction["gasLimit"] = estimateGas;
    const signedTx = await wallet.signTransaction(transaction)
    const transactionReciept = await provider.sendTransaction(signedTx)
    await transactionReciept.wait()
    const hash = transactionReciept.hash
    //const receipt = await provider.getTransactionReciept(hash);
    console.log("HASH: " + hash)
    const receipt = await provider.getTransactionReceipt(hash);     //Correccion del metodo
    return receipt;
}

async function getUsers() {
    const userContract = getContract()
    const res = await userContract.getUser()
    var users = []
    res.forEach(user => {
        users.push(formatUser(user))
    });
    return users;
}

async function getUser(userId) {
    const userContract = getContract()
    const result = await userContract.getUserById(userId)
    return result;
}

async function updateAmount(userId, amount) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    const transaction = await createTransaction(provider, "registerSale", [userId, amount]);
    const estimateGas = await provider.estimateGas(transaction);
    transaction["gasLimit"] = estimateGas;
    const signedTx = await wallet.signTransaction(transaction)
    const transactionReciept = await provider.sendTransaction(signedTx)
    await transactionReciept.wait()
    const hash = transactionReciept.hash
    //const receipt = await provider.getTransactionReciept(hash);
    const receipt = await provider.getTransactionReceipt(hash);     //Correccion del metodo
    return receipt;
}

function getContract() {
    provider = new ethers.providers.JsonRpcProvider(API_URL);
    const userContract = new ethers.Contract (
        USER_CONTRACT,
        contract.abi,
        provider
    )
    return userContract;
}

function formatUser(info) {
    return {
        firstName: info[0],
        lastName: info[1],
        amount:ethers.BigNumber.from(info[2]).toNumber(),
        id:ethers.BigNumber.from(info[3]).toNumber()
    }
}

module.exports = {
    getUser:getUser,
    getUsers:getUsers,
    createUser:createUser,
    updateAmount:updateAmount
}