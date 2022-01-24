"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.hasMany(models.transaction, {
      //   foreignKey: "transactionId",
      //   as: "transactions",
      //   onDelete: "cascade",
      //   hooks: true,
      // });
      // this.hasMany(models.beneficiary, {
      //   foreignKey: "beneficiaryId",
      //   as: "beneficiary",
      //   onDelete: "cascade",
      //   hooks: true,
      // });
    }
  }
  wallet.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      walletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      staffId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      walletType: {
        type: DataTypes.ENUM,
        values: ["Primary", "Promo", "Secondary"],
        defaultValue: "Primary",
      },
      credit: {
        type: DataTypes.NUMERIC,
        defaultValue: 0,
      },
      debit: {
        type: DataTypes.NUMERIC,
        defaultValue: 0,
      },
      balance: {
        type: DataTypes.NUMERIC,
        defaultValue: 0,
      },
      alias: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "wallet",
    }
  );
  return wallet;
};
