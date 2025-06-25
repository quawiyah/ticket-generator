const { Router } = require('express');
const { storeInformation, register, getTicket, adminLogin } = require('../controllers/ssr/informationController');
const { login, logout } = require('../controllers/api/adminController');
const informationValidator = require('../validator/informationValidator');
const checkValidation = require('../middlewares/checkValidation');
const router = Router();

router.post ('/user/login', adminLogin)

router.post('/store', informationValidator, checkValidation, storeInformation);

router.get('/ticket', (req, res) => {
  res.render('user/ticket'); // Now flash messages will show
});
router.get('/retrieve', getTicket);

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', login);
router.delete('/logout', (req, res) => {
  req.session?.destroy(() => {
    res.redirect('/login');
  });
});
router.post('/logout', (req, res) => {
  res.clearCookie('token'); // if token was stored in cookies
  res.redirect('/login');
});
module.exports = router;