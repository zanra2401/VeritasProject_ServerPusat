'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LembagaPeradilan', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      nama_lembaga: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jenis_lembaga: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      total_putusan: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      tingkatan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      id_daerah: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Daerah',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      url_api: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('LembagaPeradilan');
  },
};
