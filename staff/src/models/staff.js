'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class staff extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    staff.init({
        firstName: {
            type: DataTypes.STRING
        },
        lastName: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        phoneNumber: {
            type: DataTypes.STRING
        },
        dataOfBirth: {
            type: DataTypes.STRING
        },
        profilePix: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.STRING
        },
        country: {
            type: DataTypes.STRING
        },
        state: {
            type: DataTypes.STRING
        },
        lga: {
            type: DataTypes.STRING
        },
        bankName: {
            type: DataTypes.STRING
        },
        accountName: {
            type: DataTypes.STRING
        },
        accountNumber: {
            type: DataTypes.INTEGER
        },
        walletId: {
            type: DataTypes.INTEGER
        },
        walletBalance: {
            type: DataTypes.INTEGER
        },
        bankAccountBalance: {
            type: DataTypes.INTEGER,

        },
        status: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.STRING
        },
        employmentType: {
            type: DataTypes.STRING
        },
        businessId: {
            type: DataTypes.INTEGER
        },
        bonus: {
            type: DataTypes.INTEGER
        },
        deduction: {
            type: DataTypes.INTEGER
        },
        totalPayable: {
            type: DataTypes.INTEGER
        },
        paymentAccount: {
            type: DataTypes.STRING
        },


        password: {
            type: DataTypes.STRING
        },
        businessTradingName: {
            type: DataTypes.STRING
        },
        staffId: {
            type: DataTypes.STRING
        },
        businessAlias: {
            type: DataTypes.STRING
        },
        companyStaffId: {
            type: DataTypes.STRING
        },


    }, {
        sequelize,
        modelName: 'staff',
    });
    return staff;
};