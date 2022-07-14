const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },

    role: {
        type: String,
        enum: ['admin', 'doctor', 'patient']
    },
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)