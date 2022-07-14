const mongoose = require('mongoose')
const { Schema } = mongoose

const reportSchema = {
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
    },

    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient'
    }
}

module.exports = mongoose.model('Report', reportSchema)