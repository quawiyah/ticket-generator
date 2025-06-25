const { Router } = require('express');
const {resolve} = require('path');
const router = Router();
const {get} = require('http');
const { storeAdmin, getAdminById, updateAdmin, getAdmins, partialAdminUpdate, deleteAdmin } = require('../controllers/api/adminController');
const informationValidator = require('../validator/informationValidator');
const checkValidation = require('../middlewares/checkValidation');
const { storeInformation, getInformations, getInformationById, updateInformation, partialInformationUpdate, deleteInformation } = require('../controllers/api/informationController');

router.post('/informations', informationValidator, checkValidation, storeInformation);
router.get('/informations', getInformations);
router.get('/informations/:id', getInformationById);
router.put('/informations/:id', updateInformation);
router.patch('/informations/:id', partialInformationUpdate);
router.delete('/informations/:id', deleteInformation);

router.post('/admins', storeAdmin);
router.get('/admins', getAdmins);
router.get('/admins/:id', getAdminById)
router.put('/admins/:id', updateAdmin)
router.patch('/admins/:id', partialAdminUpdate);
router.delete('/admins/:id', deleteAdmin);

module.exports = router;