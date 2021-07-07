const express = require('express')
require('./db/mongoose')
const userRounters = require('./routers/users')
const taskRouter = require('./routers/task')

const app = express()
const PORT  = process.env.PORT

// app.use((req, res, next) => {
//     console.log(req.method, req.path)

//     next()
// })

// const multer = require('multer')
// const upload = multer({
//     dest: 'images',
//     limits:{
//         fileSize:1000000                // 1 million means 1mb
//     },
//     fileFilter(req, file, cb) {
//         if(!file.originalname.match(/\.(doc|docx)$/)){
//             return cb(new Error('Please provide a Word document'))
//         }

//         cb(undefined, true)
//     }
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({error: error.message})
// })

app.use(express.json())
app.use(userRounters)
app.use(taskRouter)

app.listen(PORT, () => {
    console.log('server is running on ' + PORT)
})

// const bcrypt = require('bcryptjs')

// const myfunction = async () => {                     // for securing password by hashing it
//     const password = 'Red12345!'
//     const hashedPassword = await bcrypt.hash(password, 8)     // 8 means that it will hash it 8 times. which is considered good

//     console.log(password)
//     console.log(hashedPassword)

//     const isMatch = await bcrypt.compare('Red12345!', hashedPassword)
//     console.log(isMatch)
// }

// const jwt = require('jsonwebtoken')

// const myfunction = async () => {
//     const token = await jwt.sign({_id: 'abc123'}, 'thisissecret', {expiresIn: '1 day'})
//     console.log(token)

//     const data = await jwt.verify(token, 'thisissecret')
//     console.log(data)
// }


// myfunction()

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     // const task = await Task.findById('5c2e505a3253e18a43e612e6')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     const user = await User.findById('5c2e4dcb5eac678a23725b5b')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()