const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Categorie = sequelize.define('Categorie', {
    categorie_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'categories',
    timestamps: false,
  });

  return Categorie;
};

