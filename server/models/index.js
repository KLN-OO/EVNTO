const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Sequelize = require('sequelize');

// Initialisation de Sequelize avec votre configuration
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
    }
);

const db = {};

// Charge tous les modèles depuis le dossier 'models'
fs.readdirSync(__dirname)
    .filter((file) => file !== 'index.js')
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize);  // <-- Passez `sequelize` ici
        db[model.name] = model;
    });

// Définition des associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Exporte l'instance de Sequelize et l'objet db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
