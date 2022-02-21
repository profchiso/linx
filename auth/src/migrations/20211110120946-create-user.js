'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('Users', {
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
            verificationCode: {
                type: Sequelize.INTEGER,

            },
            password: {
                type: Sequelize.STRING,

            },
            phone: {
                type: Sequelize.STRING,

            },
            idType: {
                type: Sequelize.STRING,

            },
            idImage: {
                type: Sequelize.STRING,

            },
            profilePix: {
                type: Sequelize.STRING,

            },
            isVerified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            isDeactivated: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            deactivationReason: {
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
        await queryInterface.dropTable('Users');
    }
};