'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class roles extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    roles.init({
        name: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'roles',
    });

    roles.associate = function(models) {
        roles.hasMany(models.staffs, { foreignKey: 'id', as: 'roles' })
        roles.hasMany(models.permissions, { foreignKey: 'id', as: 'permissions' })
    }

    return roles;
};