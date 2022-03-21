"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("clients", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      businessName: {
        type: Sequelize.STRING,
      },
      businessEmail: {
        type: Sequelize.STRING,
      },
      businessPhoneNumber: {
        type: Sequelize.STRING,
      },
      website: {
        type: Sequelize.STRING,
      },
      companyLogo: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.STRING,
      },
      lga: {
        type: Sequelize.STRING,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phoneNumber: {
        type: Sequelize.STRING,
      },
      alias: {
        type: Sequelize.STRING,
      },
      businessId: {
        type: Sequelize.INTEGER,
      },
      staffId: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
      },
      isBlacklisted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      clientType: Sequelize.STRING,
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
    await queryInterface.dropTable("clients");
  },
};
