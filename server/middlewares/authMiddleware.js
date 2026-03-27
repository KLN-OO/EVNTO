const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // Récupère le token depuis le header Authorization
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    try {
        // Vérifie le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.utilisateur = decoded; // Attache les infos de l'utilisateur à la requête
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalide' });
    }
};