'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('staffs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            firstName: {
                type: Sequelize.STRING
            },
            lastName: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            },
            phoneNumber: {
                type: Sequelize.STRING
            },
            dataOfBirth: {
                type: Sequelize.STRING
            },
            profilePix: {
                type: Sequelize.STRING
            },
            address: {
                type: Sequelize.STRING
            },
            country: {
                type: Sequelize.STRING
            },
            state: {
                type: Sequelize.STRING
            },
            lga: {
                type: Sequelize.STRING
            },
            bankName: {
                type: Sequelize.STRING
            },
            accountName: {
                type: Sequelize.STRING
            },
            accountNumber: {
                type: Sequelize.INTEGER
            },
            role: {
                type: Sequelize.STRING
            },
            employmentType: {
                type: Sequelize.STRING
            },
            businessId: {
                type: Sequelize.INTEGER
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
        await queryInterface.dropTable('staffs');
    }
};