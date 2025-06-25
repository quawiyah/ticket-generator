const { Router } = require('express');
const {resolve} = require('path');
const {get} = require('http');
const { apiLogin } = require('../controllers/api/adminController');


const router = Router();




router.post('/api/login', apiLogin);

module.exports = router;