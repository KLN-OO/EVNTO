require('dotenv').config();
const bcrypt = require('bcrypt');
const { Utilisateur, Role } = require('../models');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const utilisateur = await Utilisateur.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['libelle'] }]
    });
    if (!utilisateur) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign(
      {
        utilisateur_id: utilisateur.utilisateur_id,
        email: utilisateur.email,
        role: utilisateur.Role.libelle,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(200).json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.register = async (req, res) => {
  try {
    const { nom_utilisateur, email, mot_de_passe, prenom, nom } = req.body;
    const existingUser = await Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const nouvelUtilisateur = await Utilisateur.create({
      nom_utilisateur,
      email,
      mot_de_passe: hashedPassword,
      prenom,
      nom,
      role_id: 2
    });
    res.status(201).json({ message: 'Utilisateur enregistré', utilisateur: nouvelUtilisateur });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
exports.getMe = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findOne({
      where: { utilisateur_id: req.utilisateur.utilisateur_id },
      attributes: ['utilisateur_id', 'nom_utilisateur', 'email', 'prenom', 'nom'],
      include: [{ model: Role, attributes: ['libelle'] }]
    });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.status(200).json(utilisateur);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { nom_utilisateur, email, prenom, nom } = req.body;

    const updateData = {};
    if (nom_utilisateur !== undefined) updateData.nom_utilisateur = nom_utilisateur;
    if (email !== undefined) updateData.email = email;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (nom !== undefined) updateData.nom = nom;

    const utilisateur = await Utilisateur.findByPk(req.utilisateur.utilisateur_id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    await utilisateur.update(updateData);

    const updated = await Utilisateur.findOne({
      where: { utilisateur_id: req.utilisateur.utilisateur_id },
      attributes: ['utilisateur_id', 'nom_utilisateur', 'email', 'prenom', 'nom'],
      include: [{ model: Role, attributes: ['libelle'] }]
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
