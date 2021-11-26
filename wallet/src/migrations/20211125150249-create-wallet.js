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
                allowNull: false
            },
            ownerId: {
                type: Sequelize.INTEGER,
                allowNull: false,
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
                // allowNull: false,
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