'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class payroll extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    payroll.init({
        businessId: DataTypes.INTEGER,
        businessTradingName: DataTypes.STRING,
        fullname: DataTypes.STRING,
        salary: DataTypes.INTEGER,
        bonus: DataTypes.INTEGER,
        deduction: DataTypes.INTEGER,
        totalPayable: DataTypes.INTEGER,
        paymentAccountType: DataTypes.STRING,
        staffId: DataTypes.INTEGER,
        businessPaymentWallet: DataTypes.STRING,
        staffWallet: DataTypes.STRING,
        transactionType: DataTypes.STRING,
        batchId: DataTypes.STRING,
        totalAmount: DataTypes.DECIMAL
    }, {
        sequelize,
        modelName: 'payroll',
    });
    return payroll;
};