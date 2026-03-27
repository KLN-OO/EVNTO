const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Utilisateur = sequelize.define('Utilisateur', {
    utilisateur_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_utilisateur: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    mot_de_passe: {
      type: DataTypes.STRING,
    },
    prenom: {
      type: DataTypes.STRING,
    },
    nom: {
      type: DataTypes.STRING,
    },
    cree_le: {
      type: DataTypes.DATE,
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'roles',
        key: 'role_id',
      },
    },
  }, {
    tableName: 'utilisateurs',
    timestamps: false,
  });

  Utilisateur.associate = (models) => {
    Utilisateur.belongsTo(models.Role, { foreignKey: 'role_id' });
  };

  return Utilisateur;
};
