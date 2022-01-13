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
        paymentAccountType: DataTypes.INTEGER,

        staffId: DataTypes.INTEGER,
        businessPaymentWallet: DataTypes.INTEGER,
        staffWallet: DataTypes.INTEGER,
        transactionType: DataTypes.STRING,
        batchId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'payroll',
    });
    return payroll;
};