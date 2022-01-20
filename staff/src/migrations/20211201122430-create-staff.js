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
            walletId: {
                type: Sequelize.INTEGER
            },
            walletBalance: {
                type: Sequelize.NUMERIC,
                defaultValue: 0
            },
            bankAccountBalance: {
                type: Sequelize.NUMERIC,
                defaultValue: 0
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: "Active"
            },
            role: {
                type: Sequelize.STRING,
                defaultValue: "staff"
            },
            employmentType: {
                type: Sequelize.STRING
            },
            businessId: {
                type: Sequelize.INTEGER
            },
            bonus: {
                type: Sequelize.NUMERIC,
                defaultValue: 0
            },
            salary: {
                type: Sequelize.NUMERIC,
                defaultValue: 0
            },
            deduction: {
                type: Sequelize.NUMERIC,
                defaultValue: 0
            },
            totalPayable: {
                type: Sequelize.NUMERIC,
                defaultValue: 0
            },
            paymentAccount: {
                type: Sequelize.STRING,
                defaultValue: "wallet"
            },



            password: {
                type: Sequelize.STRING
            },
            businessTradingName: {
                type: Sequelize.STRING
            },
            staffId: {
                type: Sequelize.STRING
            },
            businessAlias: {
                type: Sequelize.STRING
            },
            companyStaffId: {
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
        await queryInterface.dropTable('staffs');
    }
};