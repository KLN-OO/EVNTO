const db = require('../models');
const { Op, Sequelize } = require('sequelize'); // pour les filtres par date

// Récupère tous les événements publics
exports.getAllPublic = async (req, res) => {
    try {
        const events = await db.Evenement.findAll({
            where: { est_publie: true },
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM inscriptions
                            WHERE inscriptions.evenement_id = "Evenement"."evenement_id"
                        )`),
                        'participantsCount'
                    ]
                ]
            }
        });
        res.json(events);
    } catch (error) {
        console.error("Erreur dans getAllPublic :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Récupère un événement public par ID
exports.getByIdPublic = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

        const event = await db.Evenement.findOne({
            where: { evenement_id: id, est_publie: true },
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM inscriptions
                            WHERE inscriptions.evenement_id = "Evenement"."evenement_id"
                        )`),
                        'participantsCount'
                    ]
                ]
            }
        });

        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé ou non publié' });
        }
        res.json(event);
    } catch (error) {
        console.error("Erreur dans getByIdPublic :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
// Récupère les événements publics filtrés par date
exports.getFilteredPublic = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Les dates de début et de fin sont requises.' });
        }

        const start = new Date(startDate + "T00:00:00Z");
        const end = new Date(endDate + "T23:59:59Z");
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Format de date invalide.' });
        }

        const events = await db.Evenement.findAll({
            where: {
                est_publie: true,
                date_fin: { [Op.gte]: start },   // l'événement finit après le début de la plage
                date_debut: { [Op.lte]: end },   // l'événement commence avant la fin de la plage
            },
            order: [['date_debut', 'ASC']], // optionnel : pour trier par date de début
        });

        res.json(events);
    } catch (error) {
        console.error("Erreur dans getFilteredPublic :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};


// Crée un nouvel événement
exports.create = async (req, res) => {
    try {
        const userId = req.utilisateur?.utilisateur_id;
        if (!userId) return res.status(401).json({ message: "Utilisateur non authentifié." });

        const { titre, description, date_debut, date_fin, categorie_id, lieu_id } = req.body;
        if (!titre || !description || !date_debut || !date_fin || !categorie_id || !lieu_id) {
            return res.status(400).json({ message: "Champs obligatoires manquants." });
        }

        const debut = new Date(date_debut);
        const fin = new Date(date_fin);
        if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
            return res.status(400).json({ message: "Format de date invalide." });
        }
        if (fin <= debut) return res.status(400).json({ message: "La date de fin doit être après la date de début." });

        const event = await db.Evenement.create({
            titre,
            description,
            date_debut: debut,
            date_fin: fin,
            categorie_id,
            lieu_id,
            organisateur_id: userId,
        });

        res.status(201).json(event);
    } catch (error) {
        console.error("Erreur dans create :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Met à jour un événement
exports.update = async (req, res) => {
    try {
        const event = await db.Evenement.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Événement non trouvé' });

        await event.update(req.body);
        res.json(event);
    } catch (error) {
        console.error("Erreur dans update :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Publie un événement
exports.publish = async (req, res) => {
    try {
        const event = await db.Evenement.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Événement non trouvé' });

        await event.update({ est_publie: true });
        res.json(event);
    } catch (error) {
        console.error("Erreur dans publish :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Supprime un événement
exports.delete = async (req, res) => {
    try {
        const event = await db.Evenement.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: 'Événement non trouvé' });

        await event.destroy();
        res.json({ message: 'Événement supprimé' });
    } catch (error) {
        console.error("Erreur dans delete :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Upload une image pour un événement
exports.uploadImage = async (req, res) => {
    res.json({ message: 'Image uploadée' });
};
