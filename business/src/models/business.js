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
    id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    tradingName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'business',
  });
  return business;
};