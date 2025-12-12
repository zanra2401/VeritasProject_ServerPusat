'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Daerah extends Model {
    static associate(models) {
      // Daerah has many LembagaPeradilan
      this.hasMany(models.LembagaPeradilan, {
        foreignKey: 'id_daerah',
        as: 'lembaga_list',
      });
    }
  }

  Daerah.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nama_daerah: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provinsi: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wilayah_hukum: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      url_server: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: 'Daerah',
      tableName: '"Daerah"',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return Daerah;
};
