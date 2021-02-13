import express from 'express'
import Mongoose from 'mongoose'
import cors from 'cors'
import bodyParser from 'body-parser'
import config from '@config/index'
import api from '@routes/api'
import Basket from '@models/Basket'
import fileUpload from 'express-fileupload'

// Set port

const port = config.port

// Database connect claster



Mongoose.connect(
    config.databaseUri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log('Connected with MongoDB')

    }
)

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(fileUpload());

// api routes
app.use(api.v1Router)
app.use(api.v2Router)

// Server start

app.get('/', (req, res) => {
    res.status(201).json({ message: 'Working' })
})

app.listen(port, () => {
    console.log(`The server running on port ${port}`)
})

