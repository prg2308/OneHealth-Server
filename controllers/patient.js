const mongoose = require('mongoose');

const User = require('../models/user');
const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const Admin = require('../models/admin');
const Doctor = require('../models/doctor');
const Report = require('../models/report');
const ExpressError = require('../utils/ExpressError');
const { report } = require('../routes/user');


module.exports.getAllPatients = async (req, res) => {
    const patients = await Patient.find({}).populate('user').populate('appointments');
    if (!patients) {
        throw new ExpressError('Patients not found', 404)
    }

    return res.status(200).json(patients)
}

module.exports.getPatient = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('User not found', 404);
    }
    const patient = await Patient.findById(id).populate('user').populate('appointments');
    if (!patient) {
        throw new ExpressError('User not found', 404)
    }

    return res.status(200).json(patient)

}

module.exports.editPatient = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('User not found', 404);
    }
    const { age, name, address, gender, mobile } = req.body;
    const update = { age, name, address, gender, mobile };
    const updatedPatient = await Patient.findByIdAndUpdate(id, update, { new: true });
    return res.status(201).json(updatedPatient)
}

module.exports.deletePatient = async (req, res) => {

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('User not found', 404);
    }
    const deletedPatient = await Patient.findByIdAndDelete(id).populate('appointments').populate('reports').populate('user')
    const userId = deletedPatient.user._id;
    await User.findByIdAndDelete(userId);
    if (deletedPatient.appointments.length) {
        for (let appointment of deletedPatient.appointments) {
            const appId = appointment._id
            const deletedApp = await Appointment.findByIdAndDelete(appId).populate('doctor')
            await Doctor.findByIdAndUpdate(deletedApp.doctor._id, { $pull: { appointments: appId } })
        }
    }

    if (deletedPatient.reports.length) {
        for (let report of deletedPatient.reports) {
            const reptId = report._id;
            const deletedRept = await Report.findByIdAndDelete(reptId).populate('doctor')
            await Doctor.findByIdAndUpdate(deletedRept.doctor._id, { $pull: { reports: reptId } })
        }
    }

    return res.status(200).json(deletedPatient)
}

module.exports.getReports = async (req, res) => {
    const { id } = req.params;
    const reports = await Report.find({ patient: id }).populate('doctor')
    if (!reports) {
        throw new ExpressError('No Reports Yet', 404)
    }

    const modifiedReports = await reports.map(r => {
        const docName = r.doctor.name
        return {...r._doc, doctor: docName}
    })
    
    res.status(200).json(modifiedReports)
}

module.exports.findReport = async (req, res) => {
    const { id, reptId } = req.params
    if (!mongoose.Types.ObjectId.isValid(reptId)) {
        throw new ExpressError('Report not found', 404);
    }
    const patient = await Patient.findById(id).populate('reports')
    const { reports } = patient
    if (!reports.length) {
        throw new ExpressError('No Reports Yet', 404)
    }
    for (let report of reports) {
        if (report._id.valueOf() === reptId) {
            return res.status(200).json(report)
        }
    }

    throw new ExpressError('Report not found', 404)
}

module.exports.getAppointments = async (req, res) => {
    const { id } = req.params;
    const appointments = await Appointment.find({ patient: id }).populate('doctor').populate('patient')
    if (!appointments.length) {
        throw new ExpressError('No Appointments Yet', 404)
    }

    return res.status(200).json(appointments)

}


module.exports.createAppointment = async (req, res) => {
    const { id } = req.params;
    const { datetime, description, doctorId } = req.body

    const patient = await Patient.findById(id);
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new ExpressError('Doctor not found', 404);
    }
    const doctor = await Doctor.findById(doctorId);
    if ((!patient) || (!doctor)) {
        throw new ExpressError('User not found', 404)
    }
    const appointment = new Appointment({ datetime, description })
    appointment.doctor = doctor
    appointment.patient = patient
    const savedApp = await appointment.save();
    patient.appointments.push(appointment)
    doctor.appointments.push(appointment)
    await patient.save();
    await doctor.save();
    return res.status(201).json(savedApp)
}

module.exports.editAppointment = async (req, res) => {
    const { appId } = req.params;
    const { datetime, description, status } = req.body

    const update = { datetime, description, status }
    const updatedApp = await Appointment.findByIdAndUpdate(appId, update, { new: true })
    if (!updatedApp) {
        throw new ExpressError('No Appointments Yet', 404)
    }
    return res.status(201).json(updatedApp)
}

module.exports.deleteAppointment = async (req, res) => {
    const { id, appId } = req.params;
    const deletedApp = await Appointment.findByIdAndDelete(appId).populate('patient').populate('doctor')
    await Patient.findByIdAndUpdate(id, { $pull: { appointments: appId } })
    await Doctor.findByIdAndUpdate(deletedApp.doctor._id, { $pull: { appointments: appId } })
    return res.status(200).json(deletedApp)
}

module.exports.register = async (req, res) => {
    const { email, password, age, name, address, gender, mobile } = req.body
    const role = 'patient'
    const appointments = []
    const reports = []
    const foundPatient = await User.findOne({ email })
    if (foundPatient) {
        throw new ExpressError('User Already Exists', 403)
    }
    const user = new User({ email, role, password })
    user.username = user.email
    const regUser = await User.register(user, password)
    const patient = new Patient({ age, name, address, gender, mobile, appointments, reports })
    patient.user = regUser;
    patient.appointments = appointments
    const savedPatient = await patient.save()
    req.login(regUser, function (err) {
        if (err) {
            return next(err)
        }
    })
    return res.status(201).json(savedPatient)

}


