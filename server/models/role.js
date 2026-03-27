const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Role = sequelize.define('Role', {
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        libelle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'roles',
        timestamps: false,
    });
    return Role;
};
