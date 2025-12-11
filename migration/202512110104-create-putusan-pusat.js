'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PutusanPusat', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      id_putusan_daerah: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Reference to putusan ID in remote regional server',
      },
      id_lembaga: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'LembagaPeradilan',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      nomor_putusan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      id_tahun: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Tahun',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      jenis_putusan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kata_kunci: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      id_klasifikasi: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Klasifikasi',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      url_detail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status_sinkronisasi: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'pending',
      },
      tanggal_upload: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('PutusanPusat');
  },
};
