const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {  // <-- Assurez-vous que le paramètre `sequelize` est bien défini ici
  const Inscription = sequelize.define('Inscription', {
    inscription_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    utilisateur_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'utilisateurs',
        key: 'utilisateur_id',
      },
    },
    evenement_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'evenements',
        key: 'evenement_id',
      },
    },
    date_inscription: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'inscriptions',
    timestamps: false,
  });

  // Ajoutez cette méthode pour définir les associations
  Inscription.associate = (models) => {
    Inscription.belongsTo(models.Evenement, {
      foreignKey: 'evenement_id',
      as: 'evenement'
    });
  };

  return Inscription;
};
