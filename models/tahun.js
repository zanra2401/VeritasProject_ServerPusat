'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tahun extends Model {
    static associate(models) {
      // Tahun has many PutusanPusat
      this.hasMany(models.PutusanPusat, {
        foreignKey: 'id_tahun',
        as: 'putusan_list',
      });
    }
  }

  Tahun.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      tahun: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      total_putusan: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
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
      modelName: 'Tahun',
      tableName: '"Tahun"',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return Tahun;
};
