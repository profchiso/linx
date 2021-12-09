'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  invoice.init({
    name: DataTypes.STRING,
    status: {
      type: DataTypes.STRING
    },
    client: {
      type: DataTypes.STRING
    },
    date: {
      type: DataTypes.STRING
    },
    amount: {
      type: DataTypes.STRING
    },
    paymentMethod: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    cost: {
      type: DataTypes.STRING
    },
    quantity: {
      type: DataTypes.STRING
    },
    discount: {
      type: DataTypes.STRING
    },
    tax: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'invoice',
  });
  return invoice;
};