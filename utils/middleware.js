const mongoose = require('mongoose');

const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const Admin = require('../models/admin');
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Report = require('../models/report');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

module.exports.validatePatient = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('User not found', 404);
    }
    const patient = await Patient.findById(id).populate('user');
    if (!patient) {
        throw new ExpressError('User not found', 404);
    }
    const user = patient.user

    if (((req.session.passport) && (req.session.passport.user === user.username)) || ((req.session.passport) && (req.session.passport.user === 'admin'))) {
        next()
    } else {
        throw new ExpressError('Unauthorized', 401)
    }

})

module.exports.canModifyPatient = catchAsync(async (req, res, next) => {
    const { appId, id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(appId)) {
        throw new ExpressError('Appointment not found', 404);
    }
    const appointment = await Appointment.findById(appId)
    if (!appointment) {
        throw new ExpressError('Appointment not found', 404);
    }
    if (appointment.patient.valueOf() === id) {
        next()
    } else {
        throw new ExpressError('Unauthorized', 401)
    }

})

module.exports.canModifyDoctor = catchAsync(async (req, res) => {
    const { reptId, id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reptId)) {
        throw new ExpressError('Appointment not found', 404);
    }
    const report = await Report.findById(reptId);
    if (!report) {
        throw new ExpressError('Report not found', 404);
    }
    if (report.patient.valueOf() === id) {
        next()
    } else {
        throw new ExpressError('Unauthorized', 401)
    }

})

module.exports.isAdmin = (req, res, next) => {
    if ((req.session.passport) && (req.session.passport.user === 'admin')) {
        next()
    } else {
        throw new ExpressError('Unauthorized', 401)
    }
}   //If checking by role, fetch from the database

module.exports.validateDoctor = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('User not found', 404);
    }

    const doctor = await Doctor.findById(id).populate('user')
    if (!doctor) {
        throw new ExpressError('User not found', 404);
    }

    const user = doctor.user
    if (((req.session.passport) && (req.session.passport.user === user.username)) || ((req.session.passport) && (req.session.passport.user === 'admin'))) {
        next()
    } else {
        throw new ExpressError('Unauthorized', 401)
    }
})