'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Wallet extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
                Wallet.belongsTo(models.Business, {
                  foreignKey: 'walletIds',
                  onDelete: 'CASCADE',
                });
        }
    };
    Wallet.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        credit: {
            type: DataTypes.INTEGER,

        },
        debit: {
            type: DataTypes.INTEGER,

        },
        balance: {
            type: DataTypes.INTEGER,

        },
    }, {
        sequelize,
        modelName: 'Wallet',
    });
    return Wallet;
};