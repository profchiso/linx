"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  client.init(
    {
      businessName: DataTypes.STRING,
      businessEmail: DataTypes.STRING,
      businessPhoneNumber: DataTypes.STRING,
      website: DataTypes.STRING,
      companyLogo: DataTypes.STRING,
      address: DataTypes.STRING,
      country: DataTypes.STRING,
      state: DataTypes.STRING,
      lga: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      alias: DataTypes.STRING,
      businessId: DataTypes.INTEGER,
      staffId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      isBlacklisted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      clientType: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "client",
    }
  );
  return client;
};
