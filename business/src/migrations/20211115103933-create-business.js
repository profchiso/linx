'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('businesses', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            tradingName: {
                type: Sequelize.STRING
            },
            businessType: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.STRING
            },
            yearOfOperation: {
                type: Sequelize.INTEGER
            },
            address: {
                type: Sequelize.STRING
            },
            country: {
                type: Sequelize.STRING
            },
            utilityBill: {
                type: Sequelize.STRING
            },
            registrationCertificate: {
                type: Sequelize.STRING
            },
            otherDocuments: {
                type: Sequelize.STRING
            },
            tin: {
                type: Sequelize.STRING
            },
            tinCertificate: {
                type: Sequelize.STRING
            },
            userId: {
                type: Sequelize.INTEGER
            },
            state: {
                type: Sequelize.STRING
            },
            rcNumber: {
                type: Sequelize.STRING
            },
            utilityBillType: {
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
    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('businesses');
    }
};