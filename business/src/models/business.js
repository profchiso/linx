'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class businesses extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    businesses.init({
        // id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        tradingName: DataTypes.STRING,
        businessType: DataTypes.STRING,
        businessSubType: DataTypes.STRING,
        description: DataTypes.STRING,
        yearOfOperation: DataTypes.STRING,
        address: DataTypes.STRING,
        headOfficeAddress: DataTypes.STRING,
        country: DataTypes.STRING,
        utilityBillImage: DataTypes.STRING,
        registrationCertificate: DataTypes.STRING,
        otherDocuments: DataTypes.STRING,
        tin: DataTypes.STRING,
        tinCertificate: DataTypes.STRING,
        userId: DataTypes.INTEGER,
        state: DataTypes.STRING,
        rcNumber: DataTypes.STRING,
        utilityBillType: DataTypes.STRING,
        alias: DataTypes.STRING,
        businessEmail: DataTypes.STRING,
        businessPhoneNumber: DataTypes.STRING,
        businessCategory: DataTypes.STRING,
        service: DataTypes.STRING,
        ownershipType: DataTypes.STRING,
        prefferedBusinessNameOne: DataTypes.STRING,
        prefferedBusinessNameTwo: DataTypes.STRING,
        branchAddress: DataTypes.STRING,
        branchCountry: DataTypes.STRING,
        branchState: DataTypes.STRING,
        branchLGA: DataTypes.STRING,
        companyObjectives: DataTypes.STRING,
        companyShareCapital: DataTypes.STRING,

    }, {
        sequelize,
        modelName: 'businesses',
    });
    return businesses;
};