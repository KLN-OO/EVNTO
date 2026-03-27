const db = require('../models');

exports.getUserEvents = async (req, res) => {
    try {
        // Récupère l'ID de l'utilisateur connecté
        const userId = req.utilisateur.utilisateur_id;

        // Vérifie que l'ID est bien défini
        if (!userId) {
            return res.status(400).json({ message: "ID utilisateur manquant." });
        }

        // Récupère les événements créés par cet utilisateur
        const events = await db.Evenement.findAll({
            where: { organisateur_id: userId }
        });

        res.json(events);
    } catch (error) {
        console.error("Erreur dans getUserEvents :", error);
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};
