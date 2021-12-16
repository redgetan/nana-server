'use strict'

global.env = process.env.NODE_ENV || "development"

const path = require("path")
const express = require('express')
const cors = require("cors") 
const morgan = require("morgan")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const middlewares = require('./controllers/middlewares')
const routes = require('./controllers/routes')
const Config = require('./config/config')[env]

global.appRoot = path.resolve(__dirname + '/../')

const PORT = process.env.PORT || 3000

const app = express()

app.use(morgan('combined'))
app.use(cors({ origin: Config.ORIGIN, credentials: true }))
app.use(cookieParser())
app.use(bodyParser.json())
app.use("/", routes.router)
app.use(middlewares.errorHandler)

app.listen(PORT, () => {
  console.log("server listening on " + PORT)  
})

