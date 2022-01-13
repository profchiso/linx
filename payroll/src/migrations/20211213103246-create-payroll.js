'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('payrolls', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            businessId: {
                type: Sequelize.INTEGER
            },
            businessTradingName: {
                type: Sequelize.STRING
            },
            fullname: {
                type: Sequelize.STRING
            },
            salary: {
                type: Sequelize.INTEGER
            },
            bonus: {
                type: Sequelize.INTEGER
            },
            deduction: {
                type: Sequelize.INTEGER
            },
            totalPayable: {
                type: Sequelize.INTEGER
            },
            paymentAccountType: {
                type: Sequelize.STRING,
                defaultValue: "Wallet"
            },
            // paymentWallet: {
            //     type: Sequelize.INTEGER
            // },
            batchId: {
                type: Sequelize.STRING,

            },
            staffId: {
                type: Sequelize.INTEGER
            },
            businessPaymentWallet: {
                type: Sequelize.INTEGER
            },
            staffWallet: {
                type: Sequelize.INTEGER
            },
            transactionType: {
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
        await queryInterface.dropTable('payrolls');
    }
};