"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      creditType: {
        type: Sequelize.ENUM,
        values: ["wallet", "bank"],
        defaultValue: "wallet",
      },
      ownersWalletId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      recipientWalletId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ownersWalletBalance: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      recipientWalletBalance: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      transactionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: "wallets",
          key: "id",
          as: "transactionId",
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("transactions");
  },
};
