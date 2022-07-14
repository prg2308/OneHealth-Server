const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/onehealth', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to mongod')
    })
    .catch((err) => {
        console.log('Connection Error', err);
    })

const Admin = require('../models/admin')
const Doctor = require('../models/doctor')
const Patient = require('../models/patient')
const User = require('../models/user')

const doctors = require('./doctors')
const patients = require('./patient')

async function insertDoctor() {
    await Doctor.insertMany(doctors)
}

async function insertPatient() {
    await Patient.insertMany(patients)
}

// insertDoctor().then(() => {
//     console.log(`Inserted ${doctors.length} values`);
//     mongoose.connection.close()
// })

// insertPatient().then(() => {
//     console.log(`Inserted ${patients.length} values`);
//     mongoose.connection.close()
// })
