const db = require('../models');

module.exports = async (req, res, next) => {
    try {
        const event = await db.Evenement.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        // Vérifie si l'utilisateur est l'organisateur ou un admin
        if (event.organisateur_id !== req.utilisateur.utilisateur_id && req.utilisateur.role !== 'admin') {
            return res.status(403).json({ message: 'Non autorisé : vous ne pouvez pas modifier cet événement' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};
