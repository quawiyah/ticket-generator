const { Router } = require('express');
const { getInformations, deleteInformation } = require('../controllers/ssr/informationController');
const { logout } = require('../controllers/api/adminController');
const router = Router();

router.get('/people', getInformations);

router.delete('/logout', (req, res) => {
  req.session?.destroy(() => {
    res.redirect('/login');
  });
});
router.post('/logout', (req, res) => {
  res.clearCookie('token'); // if token was stored in cookies
  res.redirect('/login');
});

router.delete('/people/:id', deleteInformation)

module.exports = router;