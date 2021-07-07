const mongoose = require('mongoose')

mongoose.connect(process.env.mongoDB_path,{
    useNewUrlParser: true,
    useCreateIndex: true
})

