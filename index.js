const express = require('express')
const app = express()

const saleRouters = require('./routes/sales.js')
const userRouters = require('./routes/users.js')
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(bodyParser.json())

app.use('/api', saleRouters)
app.use('/api', userRouters)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})