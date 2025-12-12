'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Klasifikasi extends Model {
    static associate(models) {
      // Klasifikasi has many PutusanPusat
      this.hasMany(models.PutusanPusat, {
        foreignKey: 'id_klasifikasi',
        as: 'putusan_list',
      });
    }
  }

  Klasifikasi.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: 'Klasifikasi',
      tableName: '"Klasifikasi"',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return Klasifikasi;
};
