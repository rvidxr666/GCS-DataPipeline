const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')

app.use(cors())
app.use(express.json())

const coin_router = require("./routers/coins")
const net_router = require("./routers/networks")
const sum_router = require("./routers/sum")

app.use("/coins", coin_router)
app.use("/networks", net_router)
app.use("/sum", sum_router)


app.listen(port, () => {
    console.log("Server is running on port: ", port)
})





