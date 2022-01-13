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
      this.belongsTo(models.wallet, {
        foreignKey: "transactionId",
        as: "transactions",
        onDelete: "CASCADE",
      });
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
      recipientWalletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ownersWalletBalance: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipientWalletBalance: {
        type: DataTypes.INTEGER,
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
