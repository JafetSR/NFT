const express = require("express")
const router = express.Router()
const nftsController = require("../scripts/nfts")

router.get('/nfts', async (req, res) => {
    try{
        let myNfts = await nftsController.getOwnedNfts()
        res.json(myNfts);
    } catch(error) {
        res.status(500).json({message:error.message})
    }
})

module.exports = router;