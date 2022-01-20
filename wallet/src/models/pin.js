"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  pin.init(
    {
      walletId: DataTypes.INTEGER,
      ownerId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      userType: DataTypes.STRING,
      alias: DataTypes.STRING,
      walletPin: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "pin",
    }
  );
  return pin;
};
