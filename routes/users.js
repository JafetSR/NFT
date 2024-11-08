const express = require("express")
const router = express.Router()
const userController = require("../controllers/users")

router.post('/createUser', async(req, res) => {
    try {
        console.log(req.body.firstName, req.body.lastName)
        let user = await userController.createUser(req.body.firstName, req.body.lastName);
        res.json(user)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
})

router.get('/user/:id', async (req, res) => {
    try{
        let user = await userController.getUser(req.params.id)
        res.json(user);
    } catch(error) {
        res.status(500).json({message:error.message})
    }
})

router.get('/users', async (req, res) => {
    try {
        let users = await userController.getUsers()
        res.json(users)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
})

router.put('/user', async (req, res) => {
    try {
        let user = await userController.updateAmount(req.body.id, req.body.amount)
        res.json(user)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
})
module.exports = router;