require ('dotenv').config({path:require('find-config')('.env')})

const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/Sales.sol/Sales.json')

const {
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    SALES_CONTRACT
} = process.env;

async function createTransaction(provider, method, params) {
    const etherInterface = new ethers.utils.Interface(contract.abi)
    const nonce = await provider.getTransactionCount(PUBLIC_KEY, 'latest')
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId} = network;
    const transaction = {
        from: PUBLIC_KEY,
        to: SALES_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method, params)
    }
    return transaction;
}

async function createSale(userId, items, prices) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const transaction = await createTransaction(provider, "insertSale", [userId, items, prices]);
    const estimatedGas = await provider.estimateGas(transaction);
    transaction["gasLimit"] = estimatedGas;
    const signedTx = await wallet.signTransaction(transaction);
    const transactionReciept = await provider.sendTransaction(signedTx);
    await transactionReciept.wait();
    const hash = transactionReciept.hash;
    const receipt = await provider.getTransactionReceipt(hash);
    return receipt;
}

async function getSales() {
    const salesContract = getContract();
    const result = await salesContract.getSales();
    var sales = [];
    result.forEach(sale => {
        sales.push(formatSale(sale));
    });
    return sales;
}

async function getSale(saleId) {
    const salesContract = getContract();
    const result = await salesContract.getSalesById(saleId);
    return formatSale(result);
}

async function getSalesByUserId(userId) {
    const salesContract = getContract()
    const result = await salesContract.getSalesByUserId(userId)
    var sales = []
    result.forEach((element) => {
        sales.push(formatSale(element))
    })
    return sales;
}

function getContract() {
    provider = new ethers.providers.JsonRpcProvider(API_URL);
    const salesContract = new ethers.Contract(
        SALES_CONTRACT,
        contract.abi,
        provider
    )
    return salesContract;
}

function formatSale(info) {
    let sale = {
        saleId: ethers.BigNumber.from(info[0]).toNumber(),      //Sales.sol - Sale ID
        userId: ethers.BigNumber.from(info[1]).toNumber()       //Sales.sol - User ID
    }
    let items = []
    info[2].forEach((element, index) => {
        let item = {
            name:element,
            price: ethers.BigNumber.from(info[3][index]).toNumber()
        }
    })
    sale.items = items;
    return sale;
}

module.exports = {
    getSale:getSale,
    getSales:getSales,
    createSale:createSale,
    getSalesByUserId:getSalesByUserId
}