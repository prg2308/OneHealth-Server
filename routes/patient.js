const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const patientControllers = require('../controllers/patient')
const { validatePatient, canModifyPatient, isAdmin } = require('../utils/middleware');
//________________________________________________________________

//Route to get all patients

router.get('/', isAdmin, catchAsync(patientControllers.getAllPatients))

//________________________________________________________________

//Routes to edit patient details

router.route('/:id')
    .get(
        validatePatient,
        catchAsync(patientControllers.getPatient))
    .patch(
        validatePatient,
        catchAsync(patientControllers.editPatient)
    )
    .delete(
        validatePatient,
        patientControllers.deletePatient
    )
//________________________________________________________________

//Routes to get reports for a specified patient

router.get('/:id/reports', validatePatient, catchAsync(patientControllers.getReports))

router.get('/:id/reports/:reptId', validatePatient, catchAsync(patientControllers.findReport))

//________________________________________________________________

//Routes to handle appointments

router.route('/:id/appointments')
    .get(
        validatePatient,
        catchAsync(patientControllers.getAppointments)
    )
    .post(
        validatePatient,
        catchAsync(patientControllers.createAppointment)
    )
// FIXME:  "Maximum call stack size exceeded" error - possible client error

router.route('/:id/appointments/:appId')
    .patch(
        validatePatient,
        canModifyPatient,
        catchAsync(patientControllers.editAppointment)
    )

    .delete(
        validatePatient,
        canModifyPatient,
        catchAsync(patientControllers.deleteAppointment)
    )
//________________________________________________________________

//Route to Register Patient

router.post('/register', catchAsync(patientControllers.register))

//________________________________________________________________

module.exports = router;