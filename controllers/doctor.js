const mongoose = require('mongoose');

const User = require('../models/user');
const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Report = require('../models/report');
const ExpressError = require('../utils/ExpressError');

module.exports.getAllDoctors = async (req, res) => {
    const { available } = req.query
    let doctors
    if ((available) && (available === 'true')) {
        doctors = await Doctor.find({ available: true }).populate('appointments')
    } else {
        doctors = await Doctor.find({}).populate('appointments')
    }
    if (!doctors.length) {
        throw new ExpressError('No Doctors Found', 404)
    }
    return res.status(200).json(doctors)
}

module.exports.createDoctor = async (req, res) => {
    const { email, password, name, specialization, available, qualifications, experience, DOB } = req.body
    const role = 'doctor'
    const appointments = []
    const reports = []
    const foundDoctor = await User.findOne({ email })
    if (foundDoctor) {
        throw new ExpressError('User Already Exists', 403)
    }

    const user = new User({ email, role, password })
    user.username = user.email
    const regUser = await User.register(user, password)
    const doctor = new Doctor({ available, name, specialization, qualifications, experience, DOB, appointments, reports })
    doctor.user = regUser;
    doctor.appointments = appointments;
    const savedDoctor = await doctor.save();
    return res.status(201).json(savedDoctor);
}

module.exports.findDoctor = async (req, res) => {
    const { id } = req.params
    const doctor = await Doctor.findById(id).populate('appointments').populate('user')
    if (!doctor) {
        throw new ExpressError('User not found', 404)
    }
    return res.status(200).json(doctor)
}

module.exports.editDoctor = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('User not found', 404);
    }

    const { name, specialization, available, qualifications, experience, DOB } = req.body
    const update = { name, specialization, available, qualifications, experience, DOB }
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, update, { new: true })
    return res.status(201).json(updatedDoctor)
}

module.exports.deleteDoctor = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError('User not found', 404);
    }
    const deletedDoctor = await Doctor.findByIdAndDelete(id).populate('appointments').populate('reports').populate('user')
    if (!deletedDoctor) {
        throw new ExpressError('User not found', 404);
    }
    const userId = deletedDoctor.user._id;
    await User.findByIdAndDelete(userId);
    if (deletedDoctor.appointments.length) {
        for (let appointment of deletedDoctor.appointments) {
            const appId = appointment._id
            const deletedApp = await Appointment.findByIdAndDelete(appId).populate('patient')
            await Patient.findByIdAndUpdate(deletedApp.patient._id, { $pull: { appointments: appId } })
        }
    }

    if (deletedDoctor.reports.length) {
        for (let report of deletedDoctor.reports) {
            const reptId = report;
            const deletedRept = await Report.findByIdAndDelete(reptId).populate('patient')
            await Patient.findByIdAndUpdate(deletedRept.patient._id, { $pull: { reports: reptId } })
        }
    }
    return res.status(200).json(deletedDoctor)
}

module.exports.getAppointments = async (req, res) => {
    const { id } = req.params
    const appointments = await Appointment.find({ doctor: id }).populate('patient')
    // const doctor = await Doctor.findById(id).populate('appointments')
    // const { appointments } = doctor
    if (!appointments.length) {
        throw new ExpressError('No Appointments Yet', 404)
    }
    return res.status(200).json(appointments)
}

module.exports.findAppointment = async (req, res) => {
    const { id, appId } = req.params
    if (!mongoose.Types.ObjectId.isValid(appId)) {
        throw new ExpressError('Appointment not found', 404);
    }
    const doctor = await Doctor.findById(id).populate('appointments')
    const { appointments } = doctor
    if (!appointments.length) {
        throw new ExpressError('No Appointments Yet', 404)
    }
    for (appointment of appointments) {
        if (appointment._id.valueOf() === appId) {
            return res.status(200).json(appointment)
        }
    }
    throw new ExpressError('Appointment not found', 404)
}

module.exports.getReports = async (req, res) => {
    const { id } = req.params;
    const doctor = await Doctor.findById(id).populate('reports')
    if (!doctor.reports.length) {
        throw new ExpressError('No Reports Yet', 404)
    }

    res.status(200).json(doctor.reports)
}

module.exports.createReport = async (req, res) => {
    const { id } = req.params
    let flag
    const doctor = await Doctor.findById(id).populate('appointments');
    const { title, description, patientId } = req.body
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        throw new ExpressError('User not found', 404);
    }

    const patient = await Patient.findById(patientId)
    if (!patient) {
        throw new ExpressError('Patient not found', 404)
    }

    if (doctor.appointments.length) {
        for (appointment of doctor.appointments) {
            if (appointment.patient.valueOf() == patientId) {
                flag = 1;
                break;
            }
        }
        if (flag == 1) {
            const report = new Report({ title, description, patient, doctor })
            patient.reports.push(report)
            doctor.reports.push(report)
            await patient.save();
            await doctor.save();
            await report.save();
            return res.status(201).json(report)
        }

        throw new ExpressError("No appointment registered by patient", 403)
    }

    throw new ExpressError('No Appointments Yet', 404)

}

module.exports.editReport = async (req, res) => {
    const { reptId } = req.params;
    const { title, description } = req.body;

    const update = { title, description };
    const updatedReport = await Report.findByIdAndUpdate(reptId, update, { new: true });
    if (!updatedReport) {
        throw new ExpressError('No Reports Yet', 404)
    }

    return res.status(201).json(updatedReport)
}

module.exports.deleteReport = async (req, res) => {
    const { id, reptId } = req.params;
    const deletedReport = await (await Report.findByIdAndDelete(reptId).populate('patient')).populate('doctor');
    await Patient.findByIdAndUpdate(id, { $pull: { report: reptId } })
    await Doctor.findByIdAndUpdate(deletedApp.doctor._id, { $pull: { report: reptId } })
    return res.status(200).json(deletedReport);
}

