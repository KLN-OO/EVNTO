const db = require('../models');

// Crée une inscription
exports.create = async (req, res) => {
    try {
        // Vérifie si l'utilisateur est déjà inscrit à cet événement
        const existingInscription = await db.Inscription.findOne({
            where: {
                utilisateur_id: req.utilisateur.utilisateur_id,
                evenement_id: req.params.id,
            },
        });

        if (existingInscription) {
            return res.status(400).json({ message: 'Vous êtes déjà inscrit à cet événement.' });
        }

        const inscription = await db.Inscription.create({
            utilisateur_id: req.utilisateur.utilisateur_id,
            evenement_id: req.params.id,
            date_inscription: new Date(),
        });
        res.status(201).json(inscription);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Annule une inscription
exports.cancel = async (req, res) => {
    try {
        const inscription = await db.Inscription.findByPk(req.params.id);
        if (!inscription || inscription.utilisateur_id !== req.utilisateur.utilisateur_id) {
            return res.status(404).json({ message: 'Inscription non trouvée ou non autorisée' });
        }
        await inscription.destroy();
        res.json({ message: 'Inscription annulée' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Récupère les inscriptions d'un événement
exports.getByEvent = async (req, res) => {
    try {
        const inscriptions = await db.Inscription.findAll({ where: { evenement_id: req.params.id } });
        res.json(inscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

exports.getMine = async (req, res) => {
    try {
        const inscriptions = await db.Inscription.findAll({
            where: { utilisateur_id: req.utilisateur.utilisateur_id },
            include: [
                {
                    model: db.Evenement,
                    as: 'evenement',
                    attributes: ['evenement_id', 'titre', 'date_debut', 'date_fin', 'lieu_id']
                }
            ]
        });
        res.json(inscriptions);
    } catch (error) {
        console.error("Erreur dans getMine :", error); // Log détaillé pour le débogage
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

