'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('permissions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            permissionName: {
                type: Sequelize.STRING
            },
            roleName: {
                type: Sequelize.STRING
            },
            businessId: {
                type: Sequelize.NUMERIC
            },
            roleId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'roles', // 'role' refers to table name
                    key: 'id', // 'id' refers to column name in role table
                }

            },

            description: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('permissions');
    }
};