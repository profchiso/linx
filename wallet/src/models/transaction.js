"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.belongsTo(models.wallet, {
      //   foreignKey: "transactionId",
      //   as: "transactions",
      //   onDelete: "CASCADE",
      // });
    }
  }
  transaction.init(
    {
      creditType: {
        type: DataTypes.ENUM,
        values: ["wallet", "bank"],
        defaultValue: "wallet",
      },
      ownersWalletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipientWalletId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      senderWalletId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      walletBalance: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      staffId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      transactionReference: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionDescription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "transaction",
    }
  );
  return transaction;
};
