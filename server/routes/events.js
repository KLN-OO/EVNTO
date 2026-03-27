const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { requireRole } = require('../middlewares/requireRole');
const canModifyEvent = require('../middlewares/canModifyEvent');

// Routes publiques
router.get('/', eventsController.getAllPublic);
router.get('/filtered', eventsController.getFilteredPublic);
router.get('/:id', eventsController.getByIdPublic);

// Routes protégées (organisateur/admin)
router.post('/', requireRole(['organisateur', 'admin']), eventsController.create);
router.put('/:id', canModifyEvent, eventsController.update);
router.patch('/:id/publish', canModifyEvent, eventsController.publish);
router.delete('/:id', canModifyEvent, eventsController.delete);
router.post('/:id/image', canModifyEvent, eventsController.uploadImage);

module.exports = router;
