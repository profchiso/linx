"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("wallets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      businessId: {
        type: Sequelize.INTEGER,
      },
      staffId: {
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      walletType: {
        type: Sequelize.ENUM,
        values: ["Primary", "Promo", "Secondary"],
        defaultValue: "Primary",
      },
      credit: {
        type: Sequelize.NUMERIC,
      },
      debit: {
        type: Sequelize.NUMERIC,
      },
      balance: {
        type: Sequelize.NUMERIC,
      },
      walletId: {
        type: Sequelize.BIGINT,
      },
      alias: {
        type: Sequelize.STRING,
      },
      category: {
        type: Sequelize.STRING,
      },
      hasPin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("wallets");
  },
};
