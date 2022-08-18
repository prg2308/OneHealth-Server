const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const { isAdmin, validateDoctor, canModifyDoctor } = require('../utils/middleware')
const doctorControllers = require('../controllers/doctor')
const { doctorSchemaValidate } = require('../utils/middleware')

//________________________________________________________________

//Routes to get all Doctors and register a doctor

router.route('/')
    .get(
        catchAsync(doctorControllers.getAllDoctors)
    )
    .post(
        doctorSchemaValidate,
        catchAsync(doctorControllers.createDoctor)
    )

//________________________________________________________________

//Routes to modify and delete doctors

router.route('/:id')
    .get(
        validateDoctor,
        catchAsync(doctorControllers.findDoctor)
    )
    .patch(
        validateDoctor,
        catchAsync(doctorControllers.editDoctor)
    )
    .delete(
        isAdmin,
        catchAsync(doctorControllers.deleteDoctor)
    )

//________________________________________________________________

//Routes to get all or a specififc appointment

router.get('/:id/appointments', validateDoctor, catchAsync(doctorControllers.getAppointments))

router.get('/:id/appointments/:appId', validateDoctor, catchAsync(doctorControllers.findAppointment))

//________________________________________________________________

//Routes to create and view reports

router.route('/:id/reports')
    .get(
        validateDoctor,
        catchAsync(doctorControllers.getReports)
    )
    .post(
        validateDoctor,
        catchAsync(doctorControllers.createReport)
    )
    .patch(
        validateDoctor,
        canModifyDoctor,
        catchAsync(doctorControllers.editReport)
    )
    .delete(
        validateDoctor,
        canModifyDoctor,
        catchAsync(doctorControllers.deleteReport)
    )

//________________________________________________________________

module.exports = router;