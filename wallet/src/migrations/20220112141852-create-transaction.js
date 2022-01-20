"use strict";

const { SequelizeMethod } = require("sequelize/dist/lib/utils");

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
      businessId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      recipientWalletId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      senderWalletId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      walletBalance: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      transactionReference: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      transactionType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      transactionStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      transactionDescription: {
        type: Sequelize.STRING,
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
      //   transactionId: {
      //     type: Sequelize.INTEGER,
      //     allowNull: false,
      //     onDelete: "CASCADE",
      //     references: {
      //       model: "wallets",
      //       key: "id",
      //       as: "transactionId",
      //     },
      //   },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("transactions");
  },
};
