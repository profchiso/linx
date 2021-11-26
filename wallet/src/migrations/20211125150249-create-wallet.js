'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('wallets', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,

            },
            businessId: {
                type: Sequelize.INTEGER,

            },
            userId: {
                type: Sequelize.INTEGER,

            },
            walletType: {
                type: Sequelize.STRING,


            },
            credit: {
                type: Sequelize.INTEGER,

            },
            debit: {
                type: Sequelize.INTEGER,

            },
            balance: {
                type: Sequelize.INTEGER,


            },
            walletId: {
                type: Sequelize.INTEGER,

            },
            alias: {
                type: Sequelize.STRING,
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
    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('wallets');
    }
};