require('dotenv').config({ path: require('find-config')('.env') });
const { ethers, Wallet } = require('ethers');
const contract = require('../artifacts/contracts/Wallet.sol/WalletMultisig.json');

const {
    API_URL,
    WALLET_ADDRESS
} = process.env;

const PUBLIC_KEYS = process.env.PUBLIC_KEYS.split(',')
const PRIVATE_KEYS = process.env.PRIVATE_KEYS.split(',')

async function createTransaction(provider, method, params, account) {
  const etherInterface = new ethers.utils.Interface(contract.abi);
  const nonce = await provider.getTransactionCount(PUBLIC_KEYS[account], 'latest');
  const gasPrice = await provider.getGasPrice();
  const network = await provider.getNetwork();
  const { chainId } = network;
  const transaction = {
      from: PUBLIC_KEYS[account],
      to: WALLET_ADDRESS,
      nonce,
      chainId,
      gasPrice,
      data: etherInterface.encodeFunctionData(method, params)
  };
  return transaction;
}

async function SubmitTransaction(to,amount,account) {
  const provider = new ethers.providers.JsonRpcProvider(API_URL)
  const Wallet = new ethers.Wallet(PRIVATE_KEYS[account],provider);
  const transaction = await createTransaction(provider,"submitTransaction",[to,amount], account)
  const estimateGas = await provider.estimateGas(transaction);
  transaction ["gasLimit"]=estimateGas;
  const signedTx  = await Wallet.signTransaction(transaction);
  const transactionReceipt = await provider.sendTransaction(signedTx);
  await transactionReceipt.wait();
  const hash= transactionReceipt.hash
  console.log("Transaction Hash: ", hash);
  const receipt = await provider.getTransactionReceipt(hash);
  return receipt

}
async function submitApprovad(idTransaction, account) {
  const provider = new ethers.providers.JsonRpcProvider(API_URL)
  const Wallet = new ethers.Wallet(PRIVATE_KEYS[account],provider);
  const transaction = await createTransaction(provider,"approveTransaction",[idTransaction], account)
  const estimateGas = await provider.estimateGas(transaction);
  transaction ["gasLimit"]=estimateGas;
  const signedTx  = await Wallet.signTransaction(transaction);
  const transactionReceipt = await provider.sendTransaction(signedTx);
  await transactionReceipt.wait();
  const hash= transactionReceipt.hash
  console.log("Transaction Hash: ", hash);
  const receipt = await provider.getTransactionReceipt(hash);
  return receipt
}
async function getTransactions(){
  const provider = new ethers.providers.JsonRpcProvider(API_URL)
  console.log(`Wallet: ${WALLET_ADDRESS}`)
  const walletContract = new ethers.Contract(WALLET_ADDRESS,contract.abi,provider);
  const result = await walletContract.getTransactions();
  var transactions = []
  result.forEach(element=> {
      transactions.push(formTransaction(element))
  });
  console.log(transactions)
  return transactions
}
async function Deposit(amount, account) {
  const provider = new ethers.providers.JsonRpcProvider(API_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEYS[account],provider)
  const walletContract = new ethers.Contract(WALLET_ADDRESS,contract.abi,wallet)
  const tx = await walletContract.deposit({value:ethers.utils.parseEther(amount)})
  await tx.wait();
  console.log("Deposit done: ",tx.hash)
}

async function formTransaction(info){
  return{
      to:info[0],
      amount:ethers.BigNumber.from(info[1]).toString(),
      approvalCount:ethers.BigNumber.from(info[2]).toNumber(),
      executed:info[3]
  }
}

async function executeTransaction(idTransaction, account) {
  const provider = new ethers.providers.JsonRpcProvider(API_URL)
  const Wallet = new ethers.Wallet(PRIVATE_KEYS[account],provider);
  const transaction = await createTransaction(provider,"executeTransaction",[idTransaction], account)
  const estimateGas = await provider.estimateGas(transaction);
  transaction ["gasLimit"]=estimateGas;
  const signedTx  = await Wallet.signTransaction(transaction);
  const transactionReceipt = await provider.sendTransaction(signedTx);
  await transactionReceipt.wait();
  const hash= transactionReceipt.hash
  console.log("Transaction Hash: ", hash);
  const receipt = await provider.getTransactionReceipt(hash);
  return receipt
}

// Função para testar
async function TestProcess(
    etherAmount,
    toAccount,
    deposit,
    submit,
    aprove,
    execute,
    envAccount
  ) {
    if (deposit) {
      await Deposit(deposit, envAccount);
    }
    if (submit) {
      await SubmitTransaction(toAccount, ethers.utils.parseEther(etherAmount), envAccount);
    }
    await SubmitTransaction(toAccount, ethers.utils.parseEther(etherAmount), envAccount);
    var transactions = await getTransactions();
  
    transactions.forEach(async (transaction, index) => {
      if (transaction.executed && aprove) {
        await submitApprovad(index, envAccount);
      }
    });
  
    transactions.forEach(async (transaction, index) => {
      if (transaction.executed && transaction.approvalCount >= 2 && execute) {
        await executeTransaction(index, envAccount);
      }
    });
  }
  
  // Testando
TestProcess("0.1", "0xb1470A2f7d60ec5DE45fCD2a4A6E9D7a2b0b941e", "0.01", false, false, false, 0);
//SUBMIT
// TestProcess("0.1", "0xb1470A2f7d60ec5DE45fCD2a4A6E9D7a2b0b941e", undefined, true, false, false, 0);
// //APROVE
// TestProcess("0.1", "0xb1470A2f7d60ec5DE45fCD2a4A6E9D7a2b0b941e", undefined, false, true, false, 0);
// TestProcess("0.1", "0xb1470A2f7d60ec5DE45fCD2a4A6E9D7a2b0b941e", undefined, false, true, false, 1);
// //EXECUTE
// TestProcess("0.1", "0xb1470A2f7d60ec5DE45fCD2a4A6E9D7a2b0b941e", undefined, false, false, true, 0);