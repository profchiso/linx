'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('businessOwners', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            firstName: {
                type: Sequelize.STRING
            },
            middleName: {
                type: Sequelize.STRING
            },
            lastName: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            },
            phone: {
                type: Sequelize.STRING
            },
            dateOfBirth: {
                type: Sequelize.STRING
            },
            nationality: {
                type: Sequelize.STRING
            },
            state: {
                type: Sequelize.STRING
            },
            lga: {
                type: Sequelize.STRING
            },
            occupation: {
                type: Sequelize.STRING
            },
            address: {
                type: Sequelize.STRING
            },
            idType: {
                type: Sequelize.STRING
            },
            idImage: {
                type: Sequelize.STRING
            },
            idNumber: {
                type: Sequelize.STRING
            },
            passport: {
                type: Sequelize.STRING
            },
            signature: {
                type: Sequelize.STRING
            },
            businessId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'businesses', // 'businesses' refers to table name
                    key: 'id', // 'id' refers to column name in businesses table
                }
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
        await queryInterface.dropTable('businessOwners');
    }
};