// middlewares/validationMiddleware.js

exports.validateRegister = (req, res, next) => {
  const { nom_utilisateur, email, mot_de_passe } = req.body;

  // Vérifie que les champs essentiels sont présents
  if (!nom_utilisateur || !email || !mot_de_passe) {
    return res.status(400).json({
      message: 'Veuillez remplir les champs : nom_utilisateur, email et mot_de_passe'
    });
  }

  // Vérifie le format de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email invalide' });
  }

  // Vérifie que le mot de passe contient au moins 6 caractères
  if (mot_de_passe.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  next(); // ✅ Tout est bon ➔ on passe à la suite (contrôleur)
};
