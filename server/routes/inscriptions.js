const express = require('express');
const router = express.Router();
const inscriptionsController = require('../controllers/inscriptionsController');
const { requireRole } = require('../middlewares/requireRole');
const canModifyEvent = require('../middlewares/canModifyEvent');

router.post('/events/:id/inscriptions', requireRole(['utilisateur', 'organisateur', 'admin']), inscriptionsController.create);
router.delete('/:id', requireRole(['utilisateur', 'organisateur', 'admin']), inscriptionsController.cancel);
router.get('/events/:id/inscriptions', canModifyEvent, inscriptionsController.getByEvent);
router.get('/me', requireRole(['utilisateur', 'organisateur', 'admin']), inscriptionsController.getMine);

module.exports = router;
