'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class business extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    business.init({
        // id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        tradingName: DataTypes.STRING,
        businessType: DataTypes.STRING,
        description: DataTypes.STRING,
        yearOfOperation: DataTypes.INTEGER,
        address: DataTypes.STRING,
        country: DataTypes.STRING,
        utilityBill: DataTypes.STRING,
        registrationCertificate: DataTypes.STRING,
        otherDocuments: DataTypes.STRING,
        tin: DataTypes.STRING,
        tinCertificate: DataTypes.STRING,
        userId: DataTypes.INTEGER,
        state: DataTypes.STRING,
        rcNumber: DataTypes.STRING,
        utilityBillType: DataTypes.STRING,

    }, {
        sequelize,
        modelName: 'business',
    });
    return business;
};