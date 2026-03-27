module.exports = {
    requireRole: (roles) => {
        return (req, res, next) => {
            if (!req.utilisateur) {
                return res.status(401).json({ message: 'Non autorisé : utilisateur non authentifié' });
            }
            if (!roles.includes(req.utilisateur.role)) {
                return res.status(403).json({ message: 'Non autorisé : rôle insuffisant' });
            }
            next();
        };
    }
};
