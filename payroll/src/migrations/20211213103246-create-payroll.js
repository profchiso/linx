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
                type: Sequelize.DECIMAL
            },
            bonus: {
                type: Sequelize.DECIMAL
            },
            deduction: {
                type: Sequelize.DECIMAL
            },
            totalPayable: {
                type: Sequelize.DECIMAL
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
                type: Sequelize.STRING
            },
            businessPaymentWallet: {
                type: Sequelize.STRING
            },
            staffWallet: {
                type: Sequelize.STRING
            },
            totalAmount: {
                type: Sequelize.DECIMAL
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