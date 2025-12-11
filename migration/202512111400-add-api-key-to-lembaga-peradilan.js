'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('LembagaPeradilan', 'api_key', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.fn('gen_random_uuid'),
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('LembagaPeradilan', 'api_key');
  },
};
