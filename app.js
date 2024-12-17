const express = require('express')
const mongoose = require('mongoose')
const auth_routes = require('./routes/auth')
const gallery_routes = require('./routes/gallery')
const cors = require('cors')
require('dotenv').config()



const app = express()
app.use(express.json())
app.use(cors())
app.use('/auth', auth_routes)
app.use('/gallery', gallery_routes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(error => console.error('MongoDB connection error:', error))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on port ${port}`))
