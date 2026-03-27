module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('utilisateurs', 'role_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'roles',
                key: 'role_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('utilisateurs', 'role_id');
    },
};
