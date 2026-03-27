const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {  // <-- Assurez-vous que le paramètre `sequelize` est bien défini ici
  const Evenement = sequelize.define('Evenement', {
    evenement_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    date_debut: {
      type: DataTypes.DATE,
    },
    date_fin: {
      type: DataTypes.DATE,
    },
    categorie_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'categories',
        key: 'categorie_id',
      },
    },
    est_publie: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lieu_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'lieux',
        key: 'lieu_id',
      },
    },
    organisateur_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'utilisateurs',
        key: 'utilisateur_id',
      },
    },
    cree_le: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'evenements',
    timestamps: false,
  });

  // Ajoutez cette méthode pour définir les associations
  Evenement.associate = (models) => {
    Evenement.hasMany(models.Inscription, {
      foreignKey: 'evenement_id',
      as: 'inscriptions'
    });
  };

  return Evenement;
};
