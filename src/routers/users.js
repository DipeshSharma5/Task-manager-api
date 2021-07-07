const express = require('express')
const routers = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const { sendWelcomeEmail, sendDeleteEmail } = require('../email/account')
const multer = require('multer')
const upload = multer({
    // dest: 'avatar',              // removing this so as to store the data in db instead of file
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return cb(new Error('Please provide a image with extension jpg, jpeg or png'))
        }

        cb(undefined, true)
    }
})

routers.get('/users/me', auth, async (req, res) => {

    res.send(req.user)

    // try {
    //     const user = await User.find({})
    //     res.send(user)
    // } catch (error) {
    //     res.status(500).send(error)
    // }

    // User.find({}).then(users => {
    //     res.send(users)
    // }).catch(error => {
    //     res.status(500).send(error)
    // })
})

routers.post('/users/login', async (req, res) => {
     try {
         const user = await User.findByCredentails(req.body.email, req.body.password)
         const token = await user.generateAuthToken()
         res.send({user, token})
     } catch (error) {
         res.status(400).send()
     }
})

routers.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

routers.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// routers.get('/users/:id', async (req, res) => {          // does need this now because of /users/me
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)
//         if(!user)
//         return res.status(404).send()

//         res.send(user)
//     } catch (error) {
//         res.status(500).send(error)
//     }

//     // User.findById(_id).then(user => {   // also can use findone()
//     //     if(!user)
//     //     return res.status(404).send()

//     //     res.send(user)
//     // }).catch(error => {
//     //     res.status(500).send(error)
//     // })
// })

routers.post('/users', async (req, res) => {
    
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e){
        res.status(400).send(e)
    }

    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

routers.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const keys = ['name', 'age', 'email','password']       // if a key is pass which is not present in db, then mongoose doesn't give and error by default. So we have to add conditons for checking the keys
    const valid = updates.every(update => keys.includes(update))

    if(!valid)
    return res.status(400).send({error: "Invalid updates"})

    const _id = req.user._id

    try {
        // const user = await User.findByIdAndUpdate(_id)

        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        // const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})    // removed this beacause it will not work with middleware
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

routers.delete('/users/me', auth,async (req, res) =>{

    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user)
        // return res.status(404).send()
        sendDeleteEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

routers.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

routers.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

routers.get('/users/me/avatar', auth, (req, res) => {
    if(!req.user.avatar)
    throw new Error('Image not present')

    res.set('Content-Type', 'image/png')    // change jpg to png because now all images will be converted to png before saving due to sharp
    res.send(req.user.avatar)
})

module.exports = routers