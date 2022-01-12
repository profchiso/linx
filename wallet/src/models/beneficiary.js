'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class beneficiary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  beneficiary.init({
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "GTB",
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "0123456789",
    },
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'beneficiary',
  });
  return beneficiary;
};