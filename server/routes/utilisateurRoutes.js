const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const { validateRegister } = require('../middlewares/validationMiddleware');

router.post('/register', validateRegister, utilisateurController.register);
router.post('/login', utilisateurController.login);

const auth = require('../middlewares/authMiddleware');

// Route profil
router.get('/me', auth, utilisateurController.getMe);
router.put('/me', auth, utilisateurController.updateMe);

module.exports = router;
