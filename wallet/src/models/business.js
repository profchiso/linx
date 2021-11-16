'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Business extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Business.hasMany(models.Wallet, {
                foreignKey: 'ownerId',
                as: 'Wallet',
              });
        }
    };
    Business.init({
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
        walletIds: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'Business',
    });
    return Business;
};