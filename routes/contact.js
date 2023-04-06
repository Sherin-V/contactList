const { use } = require('../helpers/common.helper');
const express = require('express');
const router = express.Router();

const contactContollers = require('../controllers/contact.contollers')

router.post('/saveContact', contactContollers.createNewContact_controller)

router.get('/getAllContact', contactContollers.getAllContact_controller);

router.get('/deleteContact', contactContollers.deleteContact_controller)

router.post('/updateContact', contactContollers.updateContact_controller)

router.get('/searchForContact', contactContollers.serchForaContact_controller)

module.exports = router

