const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const utilisateurController = require('../controllers/utilisateurController');
const { requireRole } = require('../middlewares/requireRole');
const authMiddleware = require('../middlewares/authMiddleware');

// Autorise la récupération et la mise à jour du propre profil via /api/users/me pour compatibilité
router.get('/me', authMiddleware, utilisateurController.getMe);
router.put('/me', authMiddleware, utilisateurController.updateMe);

router.get('/me/events', requireRole(['organisateur', 'admin']), userController.getUserEvents);

module.exports = router;
