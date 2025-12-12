'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PutusanPusat extends Model {
    static associate(models) {
      // PutusanPusat belongs to LembagaPeradilan
      this.belongsTo(models.LembagaPeradilan, {
        foreignKey: 'id_lembaga',
        as: 'lembaga',
      });

      // PutusanPusat belongs to Klasifikasi
      this.belongsTo(models.Klasifikasi, {
        foreignKey: 'id_klasifikasi',
        as: 'klasifikasi',
      });

      // PutusanPusat belongs to Tahun
      this.belongsTo(models.Tahun, {
        foreignKey: 'id_tahun',
        as: 'tahun',
      });
    }
  }

  PutusanPusat.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_putusan_daerah: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      id_lembaga: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      nomor_putusan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_tahun: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      jenis_putusan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      kata_kunci: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_klasifikasi: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      url_detail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status_sinkronisasi: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'pending',
      },
      tanggal_upload: {
        type: DataTypes.DATE,
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
      modelName: 'PutusanPusat',
      tableName: '"PutusanPusat"',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return PutusanPusat;
};
