'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class wallet extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    wallet.init({

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        walletId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        businessId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        walletType: {
            type: DataTypes.STRING,
            defaultValue: "Primary",


        },
        credit: {
            type: DataTypes.INTEGER,
            defaultValue: 0

        },
        debit: {
            type: DataTypes.INTEGER,
            defaultValue: 0

        },
        balance: {
            type: DataTypes.INTEGER,
            defaultValue: 0

        },
        alias: {
            type: DataTypes.STRING,
            allowNull: false
        },
        walletType: {
            type: DataTypes.STRING,
            defaultValue: "Primary",

        },
    }, {
        sequelize,
        modelName: 'wallet',
    });
    return wallet;
};