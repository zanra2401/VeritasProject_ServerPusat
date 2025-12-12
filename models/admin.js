"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      // no relations yet
    }
  }

  Admin.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "admin",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Admin",
      tableName: '"Admins"',
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
    }
  );

  return Admin;
};
