const express = require('express')
const router = express.Router()
const isNotLoggedIn = require('../config/isNotLoggedIn')
const isNotAdmin = require('../config/isAdmin')

const adminController = require('../controllers/admin');




// Review Applications
router.get('/applications', isNotLoggedIn, isNotAdmin, adminController.getApplications)

// Get Therapist's CV
router.get('/application/:therapistId', isNotLoggedIn, isNotAdmin, adminController.getApplication)

// Accept and Decline Application
router.post('/accept-application', isNotLoggedIn, isNotAdmin, adminController.postAcceptApplication)
router.post('/decline-application', isNotLoggedIn, isNotAdmin, adminController.postDeclineApplication)


module.exports = router