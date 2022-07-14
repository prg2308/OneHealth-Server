const express = require('express');
const router = express.Router();
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const userControllers = require('../controllers/user')
const { isAdmin } = require('../utils/middleware')

//login
router.post('/login', passport.authenticate('local'), catchAsync(userControllers.login))

//Route to get all appointments
router.get('/appointments', isAdmin, catchAsync(userControllers.getAllAppointments))

//Route to get all reports
router.get('/reports', isAdmin, catchAsync(userControllers.getAllReports))

//Route to get all users
router.get('/users', isAdmin, catchAsync(userControllers.getAllUsers))

//Route to count all the documents in each collection
router.get('/countDocs', isAdmin, catchAsync(userControllers.countDocs))

module.exports = router;