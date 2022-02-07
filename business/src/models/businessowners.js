'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class businessOwners extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    businessOwners.init({
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        middleName: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        dateOfBirth: DataTypes.STRING,
        nationality: DataTypes.STRING,
        state: DataTypes.STRING,
        lga: DataTypes.STRING,
        occupation: DataTypes.STRING,
        address: DataTypes.STRING,
        idType: DataTypes.STRING,
        idNumber: DataTypes.STRING,
        idImage: DataTypes.STRING,
        passport: DataTypes.STRING,
        signature: DataTypes.STRING,
        businessId: DataTypes.INTEGER,

    }, {
        sequelize,
        modelName: 'businessOwners',
    });
    businessOwners.associate = function(models) {
        businessOwners.hasMany(models.businesses, { foreignKey: 'id', as: 'businessOwners' })
    }
    return businessOwners;
};