'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LembagaPeradilan extends Model {
    static associate(models) {
      // LembagaPeradilan belongs to Daerah
      this.belongsTo(models.Daerah, {
        foreignKey: 'id_daerah',
        as: 'daerah',
      });

      // LembagaPeradilan has many PutusanPusat
      this.hasMany(models.PutusanPusat, {
        foreignKey: 'id_lembaga',
        as: 'putusan_list',
      });

      // LembagaPeradilan has many SinkronisasiLog
      this.hasMany(models.SinkronisasiLog, {
        foreignKey: 'id_lembaga',
        as: 'log_sinkronisasi',
      });
    }
  }

  LembagaPeradilan.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      kode_lembaga: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nama_lembaga: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jenis_lembaga: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tingkatan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alamat: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      telepon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_daerah: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      url_api: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      api_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
      modelName: 'LembagaPeradilan',
      tableName: '"LembagaPeradilan"',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return LembagaPeradilan;
};
