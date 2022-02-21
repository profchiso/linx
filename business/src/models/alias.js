'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class aliases extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    aliases.init({
        name: DataTypes.STRING,
        businessId: DataTypes.INTEGER,
        userId: DataTypes.INTEGER,

    }, {
        sequelize,
        modelName: 'aliases',
    });
    return aliases;
};