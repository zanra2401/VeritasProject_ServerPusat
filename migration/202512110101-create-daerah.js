'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Daerah', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      nama_daerah: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provinsi: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      wilayah_hukum: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      url_server: {
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
    await queryInterface.dropTable('Daerah');
  },
};
