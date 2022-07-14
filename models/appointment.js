const mongoose = require('mongoose')
const { Schema } = mongoose

const appSchema = new Schema({
    datetime: {
        type: Date,
        required: true,
    },

    status: {
        type: String,
        required: true,
        default: 'P',
        enum: ['A', 'P', 'R']
    },

    description: {
        type: String,
        required: true,
    },

    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
    },

    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient'
    },

})

module.exports = mongoose.model('Appointment', appSchema)