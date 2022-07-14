const mongoose = require('mongoose');
const { Schema } = mongoose;

const patientSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    age: {
        type: Number,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other'],
    },

    mobile: {
        type: String,
        required: true
    },

    appointments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Appointment'
        }
    ],

    reports: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Report'
        }
    ]
})

module.exports = mongoose.model('Patient', patientSchema);