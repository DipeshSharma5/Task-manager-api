const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({      // beacuse of adding middleware for converting password to hash value before saving for security
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    age: {
        type: Number,
        default: 10,
        validate(value) {
            if(value < 0)
            throw new Error('Age cannot be -ve')
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type:String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password'))
            {
                throw new Error('Password cannot be "password".')
            }
        }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
},
{
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {               // it will called whenver we the object data gets stringified. or on res.send() to remove sensitive info
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.secret_key, {expiresIn: '1 day'})

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.statics.findByCredentails = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user){
        console.log('Email not present')
        throw new Error('Unable to Login!!!')
    }
    

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        console.log('password wrong')
        throw new Error('Unable to Login!!!')
    }

    return user
}

userSchema.pre('save', async function(next) {                     // cannot use arrow function beacuse they don't bind.         // this will not work in update so have to make some changes in update function
    const user = this

    if(user.isModified('password'))                               // for checking if pssword is present in update specifically.
    {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()                                                       // for telling that function has fineshed execuction
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User

// const me = new User({
//     name: 'DipeSh'
// })

// me.save().then(() => {
//     console.log(me)
// }).catch(error => {
//     console.log(error)
// })