'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SinkronisasiLog extends Model {
    static associate(models) {
      // SinkronisasiLog belongs to LembagaPeradilan
      this.belongsTo(models.LembagaPeradilan, {
        foreignKey: 'id_lembaga',
        as: 'lembaga',
      });

      // SinkronisasiLog belongs to PutusanPusat
      this.belongsTo(models.PutusanPusat, {
        foreignKey: 'id_putusan_pusat',
        as: 'putusan',
      });
    }
  }

  SinkronisasiLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      id_lembaga: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      id_putusan_daerah: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID putusan dari ServerDaerah untuk tracking dan resync',
      },
      id_putusan_pusat: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID putusan di ServerPusat hasil sinkronisasi',
      },
      tipe_operasi: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
        allowNull: true,
        comment: 'Tipe operasi sinkronisasi',
      },
      waktu_sync: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jumlah_data: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pesan_error: {
        type: DataTypes.TEXT,
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
      modelName: 'SinkronisasiLog',
      tableName: '"SinkronisasiLog"',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return SinkronisasiLog;
};
