require('dotenv').config({path:require('find-config')('.env')});

const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const {ethers} = require('ethers')

const contract = require('../artifacts/contracts/NFTcontract.sol/NFTClase.json');

const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    CONTRACT_ADDRESS
} = process.env;

async function createImgInfo(imageRoute) {
    //console.log("entorno: ", PINATA_API_KEY, PINATA_SECRET_KEY)
    const authResponse = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
        headers: {
            "Content-Type": `multipart/form-data; boundary=${FormData._boundary}`,
            pinata_api_key:PINATA_API_KEY,
            pinata_secret_api_key:PINATA_SECRET_KEY
        }
    })
    //console.log(authResponse);
    //console.log(imageRoute)
    const stream = fs.createReadStream(imageRoute)
    const data = new FormData()
    data.append("file", stream)
    const fileResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        headers: {
            "Content-type":`multipart/form-data: boundary=${data._boundary}`,
            pinata_api_key:PINATA_API_KEY,
            pinata_secret_api_key:PINATA_SECRET_KEY
        }
    })

    const {data : fileData = {}} = fileResponse;
    const {IpfsHash} = fileData;
    const fileIPFS = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`
    console.log(fileIPFS)
    return fileIPFS
}

async function createJsonInfo(metadata) {
    console.log(`Entra a Create JsonInfo: ${metadata}`)
    const pinataJSONbody = {
        pinataContent:metadata
    }
    const jsonResponse = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS",
        pinataJSONbody,
        {
            headers: {
                "Content-Type": "application/json",
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        });
    const {data : jsonData = {}} = jsonResponse
    const {IpfsHash} = jsonData
    const tokenURI = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`
    console.log("Token URI " + tokenURI)
    return tokenURI
}

async function mintNFT(tokenURI) {
    try {       
        console.log("Entra a mintNFT: " + API_URL)
        const provider = new ethers.providers.JsonRpcProvider(API_URL)
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
        const etherInterface = new ethers.utils.Interface(contract.abi)
        const nonce = await provider.getTransactionCount(PUBLIC_KEY, 'latest')
        const gasPrice = await provider.getGasPrice();
        const network = await provider.getNetwork();
        const {chainId} = network;

        const transaction = {
            from: PUBLIC_KEY,
            to: CONTRACT_ADDRESS,
            nonce,
            chainId,
            gasPrice,
            data: etherInterface.encodeFunctionData("mintNFT", [PUBLIC_KEY, tokenURI])
        }
        console.log(`Transaccion: ${transaction}`)
        const estimateGas = await provider.estimateGas(transaction)
        transaction["gasLimit"] = estimateGas
        const signedTx = await wallet.signTransaction(transaction)
        const transactionReceipt = await provider.sendTransaction(signedTx)
        await transactionReceipt.wait();
        const hash = transactionReceipt.hash;
        console.log("Transaction HASH: ", hash)

        const receipt = await provider.getTransactionReceipt(hash);
        const {logs} = receipt
        const tokenInBigNumber = ethers.BigNumber.from(logs[0].topics[3])
        const tokenId = tokenInBigNumber.toNumber();
        console.log("NFT TOKEN ID: ", tokenId);
        
        return hash;
    } catch(Error) {
        console.error(`Error: ${Error}`)
    }
}

async function createNFT(info){
    var imgInfo = await createImgInfo(info.imageRoute);
    const metadata = {
        image:imgInfo,
        name:imgInfo.name,
        description:info.description,
        attributes:[
            {'trait_type':'color','value':'brown'},
            {"trait_type":'background','value':'white'}
        ]
    }
    var tokenUri = await createJsonInfo(metadata)
    var nftResult = await mintNFT(tokenUri)
    return nftResult
}

async function getTokens() {
    const options = {method: "GET", headers: {accept: "application/json"}}

    // const response = await fetch(`${API_URL}/getNFTsForOwner?owner=${PUBLIC_KEY}`, options)
    // return await response.json()
        // .then((res) => console.log(res.json()))
        // .catch((err) => console.error("error:" + err));
    
    const jsonResponse = await axios.get(`${API_URL}/getNFTsForOwner?owner=${PUBLIC_KEY}`,
        {
            headers: {
                "Content-Type": "application/json",
            }
        });
    
        console.log(jsonResponse.data)
}

async function getOwnedNfts() {
    try {
        const provider = new ethers.providers.JsonRpcProvider(API_URL)
        const nftsContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            contract.abi,
            provider
        )
        const nfts = await nftsContract.getOwnedNfts(PUBLIC_KEY);

        nfts.forEach(nft => {
            console.log(`NFT ID: ${nft[0]}, URI: ${nft[1]}`);
        })
    }
    catch(error) {
        console.log(error);
    }
}

// function getContract() {
//     provider = new ethers.providers.JsonRpcProvider(API_URL);
//     const nftsContract = new ethers.Contract(
//         CONTRACT_ADDRESS,
//         contract.abi,
//         provider
//     )
//     return nftsContract;
// }

// function formatSale(info) {
//     let sale = {
//         saleId: ethers.BigNumber.from(info[0]).toNumber(),      //Sales.sol - Sale ID
//         userId: ethers.BigNumber.from(info[1]).toNumber()       //Sales.sol - User ID
//     }
//     let items = []
//     info[2].forEach((element, index) => {
//         let item = {
//             name:element,
//             price: ethers.BigNumber.from(info[3][index]).toNumber()
//         }
//     })
//     sale.items = items;
//     return sale;
// }

// async function testeo() {
//     console.log(await getTokens());
// }

// miInfo = {
//     imageRoute: '../images/logo.png',
//     description: 'Esto es una prueba de un NFT'
// }

//createNFT(miInfo)

//createImgInfo('../images/logo.png')
//testeo()
module.exports = {
    createNFT:createNFT,
    getOwnedNfts:getOwnedNfts
}