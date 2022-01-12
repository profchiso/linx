"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("beneficiaries", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: "wallet",
          key: "walletId",
        },
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "GTB",
      },
      accountNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "0123456789",
      },
      walletId: {
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("beneficiaries");
  },
};
