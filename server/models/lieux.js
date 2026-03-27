const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lieu = sequelize.define('Lieu', {
    lieu_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING,
    },
    adresse: {
      type: DataTypes.STRING,
    },
    ville: {
      type: DataTypes.STRING,
    },
    etat: {
      type: DataTypes.STRING,
    },
    code_postal: {
      type: DataTypes.STRING,
    },
    pays: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'lieux',
    timestamps: false,
  });

  return Lieu;
};
